/**
 * @since 20180125 20:59
 * @author vivaxy
 */

const path = require('path');

const test = require('ava');
const NodeRSA = require('node-rsa');
const fse = require('fs-extra');

const readKey = async(type) => {
    return await fse.readFile(path.join(__dirname, '..', `${type}.key`), 'utf8');
};

const message = 'My Secrets';

test('message should be able to be encrypted by private key and decrypted by public key', async(t) => {
    const publicKeyString = await readKey('public');
    const privateKeyString = await readKey('private');
    const publicKey = new NodeRSA(publicKeyString, 'pkcs8-public-pem');
    const privateKey = new NodeRSA(privateKeyString, 'pkcs1-private-pem');
    t.is(privateKey.decrypt(publicKey.encrypt(message, 'base64'), 'utf8'), message);
});

test('message should be able to be encrypted by private key and decrypted by private key', async(t) => {
    const publicKeyString = await readKey('public');
    const privateKeyString = await readKey('private');
    const publicKey = new NodeRSA(publicKeyString, 'pkcs8-public-pem');
    const privateKey = new NodeRSA(privateKeyString, 'pkcs1-private-pem');
    t.is(privateKey.decrypt(privateKey.encrypt(message, 'base64'), 'utf8'), message);
});

test('message should not be able to be encrypted by private key and decrypted by public key', async(t) => {
    const publicKeyString = await readKey('public');
    const privateKeyString = await readKey('private');
    const publicKey = new NodeRSA(publicKeyString, 'pkcs8-public-pem');
    const privateKey = new NodeRSA(privateKeyString, 'pkcs1-private-pem');
    t.throws(() => {
        publicKey.decrypt(privateKey.encrypt(message, 'base64'), 'utf8');
    }, Error);
});

test('message should not be able to be encrypted by public key and decrypted by public key', async(t) => {
    const publicKeyString = await readKey('public');
    const privateKeyString = await readKey('private');
    const publicKey = new NodeRSA(publicKeyString, 'pkcs8-public-pem');
    const privateKey = new NodeRSA(privateKeyString, 'pkcs1-private-pem');
    t.throws(() => {
        publicKey.decrypt(publicKey.encrypt(message, 'base64'), 'utf8');
    }, Error);
});
