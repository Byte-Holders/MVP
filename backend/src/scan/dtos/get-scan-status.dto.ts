export class GetScanStatusDto {
  // TODO tipo
  repository: {
    name: string;
    owner: string;
  };
  branch: string;
}
