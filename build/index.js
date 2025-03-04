"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preLoad = void 0;
const privateKey = process.env.PRIVATE_KEY || '';
const passphrase = process.env.PASSPHRASE || '';
const preLoad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        if (!privateKey) {
            res
                .status(500)
                .send('Private key is empty. Please check your env variable "privateKey".');
        }
        if (!passphrase) {
            res
                .status(500)
                .send('Passphrase key is empty. Please check your env variable "passphrase".');
        }
        console.info('preload || ', JSON.stringify(body));
        res.append('Content-Type', 'application/json');
        res
            .status(200)
            .send("Hello, World!");
    }
    catch (err) {
        res.status(500).send(JSON.stringify(err));
    }
});
exports.preLoad = preLoad;
