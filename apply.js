"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.apply = void 0;
const k8s = __importStar(require("@kubernetes/client-node"));
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const util_1 = require("util");
/**
 * Replicate the functionality of `kubectl apply`.  That is, create the resources defined in the `specFile` if they do
 * not exist, patch them if they do exist.
 *
 * @param specPath File system path to a YAML Kubernetes spec.
 * @return Array of resources created
 */
function apply(specPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        const client = k8s.KubernetesObjectApi.makeApiClient(kc);
        const fsReadFileP = (0, util_1.promisify)(fs.readFile);
        const specString = yield fsReadFileP(specPath, 'utf8');
        const specs = yaml.loadAll(specString);
        const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
        const created = [];
        for (const spec of validSpecs) {
            // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
            // without metadata out
            spec.metadata = spec.metadata || {};
            spec.metadata.annotations = spec.metadata.annotations || {};
            delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
            spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);
            try {
                // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
                // block.
                yield client.read(spec);
                // we got the resource, so it exists, so patch it
                const response = yield client.patch(spec);
                created.push(response.body);
                console.log(response.body);
            }
            catch (e) {
                // we did not get the resource, so it does not exist, so create it
                const response = yield client.create(spec);
                created.push(response.body);
                console.log(response.body);
            }
        }
        return created;
    });
}
exports.apply = apply;
