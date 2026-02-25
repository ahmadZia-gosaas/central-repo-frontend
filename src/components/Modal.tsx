import React from 'react'
import { confirm } from './Confirm'

interface ModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
    footer?: React.ReactNode
    size?: 'sm' | 'lg' | 'xl'
    confirmationOnCancel?: boolean
}

function Modal({
    isOpen,
    title,
    onClose,
    children,
    footer,
    size = 'lg',
    confirmationOnCancel = false
}: ModalProps) {
    if (!isOpen) return null

    const handleClose = async () => {
        if (confirmationOnCancel) {
            if (await confirm({ message: 'Are you sure you want to cancel?' })) {
                onClose()
            }
        } else {
            onClose()
        }
    }

    const sizeClass = {
        sm: 'modal-sm',
        lg: 'modal-lg',
        xl: 'modal-xl'
    }[size]

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={handleClose}>
            <div className={`modal-dialog modal-dialog-centered ${sizeClass}`} style={{ maxWidth: size === 'sm' ? '500px' : size === 'lg' ? '800px' : '1000px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    {footer && (
                        <div className="modal-footer border-top">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Modal
