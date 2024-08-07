import BuilderWidget from './widgets/BuilderWidget.jsx';
import StoryWidget from './widgets/StoryWidget.jsx';

if(window.customElements.get("com-sap-file-upload-widget-builder") === undefined) {
    window.customElements.define("com-sap-file-upload-widget-builder", BuilderWidget);
}

if (window.customElements.get("com-sap-file-upload-widget") === undefined) {
    window.customElements.define("com-sap-file-upload-widget", StoryWidget);
}