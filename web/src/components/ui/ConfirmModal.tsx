"use client";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title="Confirmer", message, confirmLabel="Confirmer", loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-3 items-start">
        <div className="p-2 bg-red-50 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-sm text-surface-700 pt-1">{message}</p>
      </div>
    </Modal>
  );
}
