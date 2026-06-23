//backend/src/lib/errors.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode = 400, public details?: unknown) {
    super(message); this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
export class NotFoundError   extends AppError { constructor(r="Ressource") { super(`${r} introuvable`, 404); } }
export class ConflictError   extends AppError { constructor(m="Conflit")   { super(m, 409); } }
export class ForbiddenError  extends AppError { constructor(m="Accès refusé") { super(m, 403); } }
export class UnauthorizedError extends AppError { constructor(m="Non autorisé") { super(m, 401); } }
