/**
 * @since 20180125 20:49
 * @author vivaxy
 */

const fse = require('fs-extra');
const NodeRSA = require('node-rsa');

const main = async() => {
    const key = new NodeRSA({ b: 512 });

    const publicKey = key.exportKey('pkcs8-public-pem');
    const privateKey = key.exportKey('pkcs1-private-pem');
    await fse.outputFile('public.key', publicKey);
    await fse.outputFile('private.key', privateKey);
    console.log('public key');
    console.log(publicKey);
    console.log('private key');
    console.log(privateKey);
};

main();
