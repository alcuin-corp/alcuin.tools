export interface IAnyObjectDto {
    Id: string;
    ObjectType: string;
}

export interface IRefDto {
    TargetId: string;
    IsRef: true;
    RefType: "Required";
}

export interface IExportMetadataDto {
    DbVersion: number;
    ApiVersion: string;
    Version: string;
    Date: string;
    Duration: number;
    Origin: string;
    Exported: number;
    Errors: number;
    Warnings: number;
}

export interface IAlertDto {
    Name: string;
    Id: string;
    StackTrace: string;
    Message: string;
    ObjectType: string;
}

export interface IExportDto {
    Metadata: IExportMetadataDto;
    Alerts: IAlertDto[];
    Content: {
        Added: IAnyObjectDto[];
        Updated: any[];
        Deleted: any[];
    };
}
