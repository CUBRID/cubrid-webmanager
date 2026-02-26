import {Button, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styles from './SuccessModal.module.css';
import { setSuccessModal } from '../../../../shared/slice/globalSlice';

const SuccessModal = () => {
  const { successModal } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  return (
    <Modal
      zIndex={1100}
      title={successModal.title}
      open={successModal.open}
      footer={[
        <Button type={'primary'} onClick={() => dispatch(setSuccessModal({ open: false }))}>
          Close
        </Button>,
      ]}
    >
      <p className={styles.success__text}>{successModal.message}</p>
    </Modal>
  );
};

export default SuccessModal;
