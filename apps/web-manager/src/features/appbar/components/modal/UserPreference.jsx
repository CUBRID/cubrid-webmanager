import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Typography, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setUpdatePassword } from '@/features/appbar/appBarSlice.js';
import { updatePasswordAPI, updateUserAPI } from '@/features/auth/authAPI.js';
import { setBuffering } from '@/shared/slice/globalSlice.js';
import { setUserPreference } from '../../appBarSlice';
import styles from '../../../sidenav/styles/Modal.module.css';
import { getUserPreferenceAPI, updateUserPreferenceAPI } from '../../appBarAPI';
import { setPreference } from '../../../../shared/slice/globalSlice';
const { Text } = Typography;

const UserPreference = () => {
  const {preference} = useSelector((state) => state.global);
  const {activeHost} = useSelector((state) => state.host);
  const { userPreference } = useSelector((state) => state.appBar);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        dispatch(setBuffering(true));
        const response = await updateUserPreferenceAPI(values)
          .finally(()=>{
            dispatch(setBuffering(false));
          })
        if(response.success){
          await refreshPreference()
          handleClose()
        }
      })
  };

  const handleClose = () => {
    form.resetFields();
    dispatch(setUserPreference(false));
  };
  const refreshPreference = () => {
    getUserPreferenceAPI().then((response) => {
      if (response.success) {
        dispatch(setPreference(response.result));
      }
    });
  }
  useEffect(() => {
    if(userPreference) {
      form.setFieldsValue({
        ...preference,
      })
    }
  }, [userPreference]);

  return (
    <Modal
      title="User Password"
      open={userPreference}
      cancelText="Cancel"
      footer={() => {
        return (
          <div style={{ width: '100%', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type={'primary'}
              variant={'filled'}
              className={'button button__small'}
              onClick={() => handleClose()}
            >
              Close
            </Button>
            <Button type="primary" onClick={handleOk}>
              Update
            </Button>
          </div>
        );
      }}
    >
      <Form form={form} layout="horizontal" name="create_user_form">
        <div className={styles.db__layout}>
          <div className={'border__text'}>Dashboard Config</div>
          <Row>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 10 }}
                name="dashboardInterval"
                label="Dashboard Interval"
                rules={[{ required: true, message: 'required' }]}
              >
                <Input type={'number'} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 10 }}
                name="brokerStatusInterval"
                label="Broker Status Interval"
                rules={[{ required: true, message: 'required' }]}
              >
                <Input type={'number'} />
              </Form.Item>
            </Col>
          </Row>
        </div>

      </Form>
    </Modal>
  );
};

export default UserPreference;
