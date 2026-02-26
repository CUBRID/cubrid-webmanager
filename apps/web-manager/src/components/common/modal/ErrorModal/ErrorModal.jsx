import { App, Button, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setErrorModal } from '@/shared/slice/globalSlice.js';
import styles from './ErrorModal.module.css';

const ErrorModal = ({ title, content }) => {
  const { errorModal } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  return (
    <Modal
      zIndex={1100}
      title={errorModal.title}
      open={errorModal.open}
      footer={[
        <Button type={'primary'} onClick={() => dispatch(setErrorModal({ open: false }))}>
          Close
        </Button>,
      ]}
    >
      <p className={styles.text__error}>{errorModal.message}</p>
    </Modal>
  );
};

export default ErrorModal;
