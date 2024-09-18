/**
 * Convert a JS array of float numbers into a binary representation
 * to suit SAP HANA Vector Store buffer.
 * 
 * Note: This is a general implementation working, which should work
 * on all processor architectures and runtimes.
 * 
 * @example
 * let binaryVector = generalArray2VectorBufferFunction([1.2, -0.32, -0.52, 3.21234]);
 * 
 * @param data JS array of float numbers representing an embedding
 * @returns binary vector buffer
 */
const _generalArray2VectorBufferFunction = (data: Array<number>): Buffer => {
    const sizeFloat = 4;
    const sizeDimensions = 4;
    const bufferSize = data.length * sizeFloat + sizeDimensions;

    const buffer = Buffer.allocUnsafe(bufferSize);
    // write size into buffer
    buffer.writeUInt32LE(data.length, 0);
    data.forEach((value: number, index: number) => {
        buffer.writeFloatLE(value, index * sizeFloat +sizeDimensions);
    });
    return buffer;
};

/**
 * Convert a JS array of float numbers into a binary representation
 * to suit SAP HANA Vector Store buffer.
 * 
 * Note: This is an optimized implementation, which only works on
 * little endian runtimes.
 * 
 * @example
 * let binaryVector = generalArray2VectorBufferFunction([1.2, -0.32, -0.52, 3.21234]);
 * 
 * @param data JS array of float numbers representing an embedding
 * @returns binary vector buffer
 */
const _nativeLEArray2VectorBufferFunction = (data: Array<number>): Buffer => {
    data.unshift(0);
    const buffer = Buffer.from(Float32Array.from(data).buffer);
    data.shift();
    // write dimensions into buffer
    buffer.writeUint32LE(data.length);
    return buffer;
};

/**
 * Determines, whether the runtime uses Little Endian or Big Endian
 */
const _isLittleEndian = () => {
    // Inpired by: 
    // https://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness
    var arrayBuffer = new ArrayBuffer(2);
    var uint8Array = new Uint8Array(arrayBuffer);
    var uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte
    return uint16array[0] === 0xBBAA;
}

const array2VectorBuffer = _isLittleEndian() ? _nativeLEArray2VectorBufferFunction : _generalArray2VectorBufferFunction;
const vectorBuffer2Array = (buffer: Buffer): Array<number> => {
    const sizeDimensions = 4;
    let result = [];
    let offset = sizeDimensions;
    while (offset < buffer.length) {
        const value = buffer.readFloatLE(offset);
        result.push(value)
        offset += 4;
    }
    return result;
};

export { array2VectorBuffer, vectorBuffer2Array };
