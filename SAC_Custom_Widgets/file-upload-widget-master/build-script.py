import os
import re
import subprocess
import shutil
import glob
import json
import hashlib
import sys
import base64


# Gets the next target version based off of the version directory contents
def get_next_version_number(directory, versionChangeType="PATCH"):
    files = glob.glob(os.path.join(directory, 'fileUploadWidget-*.zip'))

    version_numbers = [re.search(r'fileUploadWidget-([\d.]+)', file).group(1)
                       for file in files if re.search(r'fileUploadWidget-([\d.]+)', file)]
    # Split the version into its components (major, minor, patch)
    version_components = [list(map(int, v.split('.')[:-1])) for v in version_numbers]

    if version_components:
        # Sort the versions by major, minor, patch
        version_components.sort(key=lambda v: (v[0], v[1], v[2]))
        # Get the latest version
        latest_version = version_components[-1]
        print("Current version is", '.'.join(map(str, latest_version)))
        # Increment the patch version
        if versionChangeType == "PATCH":
                latest_version[2] += 1
        elif versionChangeType == "MINOR":
                latest_version[1] += 1
        elif versionChangeType ==  "MAJOR":
                latest_version[0] += 1
        elif versionChangeType ==  "OVERWRITE":
                print("Going to overwrite current version...")
        else:
             print("No version specified, read the readme...")
             exit()
        # Join the components back together
        next_version = '.'.join(map(str, latest_version))
        return next_version
    else:
        return '1.0.0'

def run_npm_build():
    print("Running `npm run build`")
    result = subprocess.run(['npm', 'run', 'build'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, timeout=500)
    return result.returncode == 0

def zip_directory(source, destination):
    shutil.make_archive(destination, 'zip', source)

def get_javascript_file_info():
    files = glob.glob(os.path.join("./dist", "*.js"))
    file_name = "file-upload-widget.iife.js"
    file_path = [file for file in files if file_name in file][0]
    if file_path.endswith(".iife.mjs"):
         # Rename to js
        with open (file_path, 'r') as r:
            with open(file_path.replace(".iife.js", ".js"), 'w') as w:
                w.write(r.read())
        os.remove(file_path)
        file_name = file_name.replace(".iife.js", ".js")
        files = glob.glob(os.path.join("./dist", "*.js"))
    if len([file for file in files if file_name in file]):
        print("Found the main javascript  file", file_name)
        return file_name, "sha256-"+get_b64_sha256_hash(os.path.join("dist", file_name))

    print("Error finding javascript file name after build")
    exit(1)

def get_b64_sha256_hash(file_path):
    with open(file_path,"rb") as f:
        bytes = f.read()
        b64_hash = base64.b64encode(hashlib.sha256(bytes).digest())
        return b64_hash.decode()

def handle_json_update(file_name, sha256, version):
    version = str(version)
    print("Handling json template file update")
    target_file_path = "./versions/fileUploadWidget-"+version+".json"
    with open("fileUploadWidgetTemplate.json") as template_file_fp:
        template = json.load(template_file_fp)

        template['version'] = version

        template['webcomponents'][0]['url'] = "/" + file_name
        template['webcomponents'][0]['integrity'] = sha256

        template['webcomponents'][1]['url'] = "/" + file_name
        template['webcomponents'][1]['integrity'] = sha256
        with open(target_file_path, "w") as target_file_fp:
            json.dump(template, target_file_fp)
            print("Saved", target_file_path)

def main():
    version_change_types = ["PATCH", "MINOR", "MAJOR", "OVERWRITE"]
    change_type_idx = int(sys.argv[1])
    print("Beginning the latest build of type", version_change_types[change_type_idx])
    npm_build_success = run_npm_build()
    file_name, file_hash  = get_javascript_file_info()
    if npm_build_success:
        print("Getting next version number")
        version = get_next_version_number('./versions', version_change_types[change_type_idx])
        print("Next version will be", version)
        handle_json_update(file_name, file_hash, version)
        version_path = f'./versions/fileUploadWidget-{version}'
        zip_directory('./dist', version_path)
        print("Saved", version_path)
    else:
        print('npm run build failed')

if __name__ == '__main__':
    main()