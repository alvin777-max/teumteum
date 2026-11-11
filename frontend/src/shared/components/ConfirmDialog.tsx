import Button from './Button'

interface ConfirmDialogProps {
  message: string
  /** 메시지 아래 보조 설명 */
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** 페이지 안에서 한 번 더 확인하는 창 (저장 해제·로그아웃 등). 브라우저 confirm 대신 쓴다 */
export default function ConfirmDialog({ message, description, confirmLabel = '확인', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-112 rounded-2xl bg-white p-5">
        <p className="font-bold">{message}</p>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
