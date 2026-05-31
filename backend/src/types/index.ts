export type { Role, TypePiece, TypeBenne, StatutPieceRC, StatutPieceIC,
  StatutCorrespondance, Transporteur, StatutExpedition, CauseRetour,
  StatutAlerteRC, StatutAnomalie, StatutTriImpossible, StatutConge,
  TypeFluxReception, TypePieceLogistique, TypeNotification, StatutMailLog,
  CategorieProbleme, TypeRangement, ResponsabiliteRetour,
} from "@prisma/client";

export interface ApiOk<T>   { success: true;  data: T; }
export interface ApiErr     { success: false; error: string; details?: unknown; }
export interface PageMeta   { page:number; limit:number; total:number; totalPages:number; }
export interface PageRes<T> { success:true; data:T[]; meta:PageMeta; }
export interface UserCtx    { userId:string; email:string; role:string; }
