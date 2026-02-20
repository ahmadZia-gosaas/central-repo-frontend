import React from 'react'

interface ModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
    footer?: React.ReactNode
    size?: 'sm' | 'lg' | 'xl'
}

function Modal({ isOpen, title, onClose, children, footer, size = 'lg' }: ModalProps) {
    if (!isOpen) return null

    const sizeClass = {
        sm: 'modal-sm',
        lg: 'modal-lg',
        xl: 'modal-xl'
    }[size]

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
            <div className="modal-dialog" style={{ maxWidth: size === 'sm' ? '500px' : size === 'lg' ? '800px' : '1000px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose}
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
