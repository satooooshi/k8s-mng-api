"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStatus = void 0;
/**
* APIGroup contains the name, the supported versions, and the preferred version of a group.
*/
class ServiceStatus {
    static getAttributeTypeMap() {
        return null;
    }
}
exports.ServiceStatus = ServiceStatus;
ServiceStatus.discriminator = undefined;
ServiceStatus.attributeTypeMap = [
    {
        "name": "apiVersion",
        "baseName": "apiVersion",
        "type": "string"
    },
    {
        "name": "kind",
        "baseName": "kind",
        "type": "string"
    },
    {
        "name": "name",
        "baseName": "name",
        "type": "string"
    },
    {
        "name": "preferredVersion",
        "baseName": "preferredVersion",
        "type": "V1GroupVersionForDiscovery"
    },
    {
        "name": "serverAddressByClientCIDRs",
        "baseName": "serverAddressByClientCIDRs",
        "type": "Array<V1ServerAddressByClientCIDR>"
    },
    {
        "name": "versions",
        "baseName": "versions",
        "type": "Array<V1GroupVersionForDiscovery>"
    }
];
