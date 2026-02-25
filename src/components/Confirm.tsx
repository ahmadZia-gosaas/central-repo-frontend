
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<{ message: string }, boolean>) => (
    <div className={`modal modal-confirm ${show ? 'show d-block' : 'd-none'}`} tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg border-0">
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title">Confirmation</h5>
                    <button type="button" className="btn-close" onClick={() => proceed(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body py-4">
                    <p className="mb-0 fs-5 text-secondary">{message}</p>
                </div>
                <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light px-4" onClick={() => proceed(false)}>No</button>
                    <button type="button" className="btn btn-primary px-4" onClick={() => proceed(true)}>Yes</button>
                </div>
            </div>
        </div>
    </div>
);

export const confirm = createConfirmation(confirmable(MyDialog));