"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// A reusable "are you sure?" modal for any destructive action (delete one
// row, bulk-delete many rows, etc). Centralizing this avoids duplicating the
// same confirm dialog in five different places.
export function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} isLoading={isSubmitting}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
