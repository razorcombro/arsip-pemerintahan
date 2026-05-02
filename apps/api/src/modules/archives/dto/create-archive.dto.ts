export class CreateArchiveDto {
  archiveNumber: string;
  letterNumber?: string;
  title: string;
  summary?: string;
  createdByUnitId: string;
  classificationId: string;
  securityLevel?: "BIASA" | "TERBATAS" | "RAHASIA" | "SANGAT_RAHASIA";
  status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "DESTROYED";
  keywords?: string[];
}
