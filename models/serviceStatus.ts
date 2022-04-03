/**
* APIGroup contains the name, the supported versions, and the preferred version of a group.
*/
export class ServiceStatus {
    /**
    * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
    */
    'apiVersion'?: string;
    /**
    * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
    */
    'kind'?: string;
    /**
    * name is the name of the group.
    */
    'name': string;


    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
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
        }    ];

    static getAttributeTypeMap() {
        return null
    }
}