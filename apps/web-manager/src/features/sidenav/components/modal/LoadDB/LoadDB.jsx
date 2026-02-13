import { Button, Checkbox, Col, Form, Input, Modal, Radio, Row, Select, Table } from 'antd';
import styles from '../../../styles/Modal.module.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoadDB } from '../../../sideNavSlice';
import InputCheckBox from '../../../../../components/composite/InputCheckBox/InputCheckBox';
import { getUnloadDBAPI, loadDBAPI } from '../../../../domain/database/databaseAPI';
import setData from 'lodash/_setData';
import { nanoid } from 'nanoid';
import { setBuffering, setSuccessModal } from '../../../../../shared/slice/globalSlice';

const data = [
  { key: '1', loadType: true, path: '/usr/bin', date: '2026-02-11' },
  { key: '2', loadType: false, path: '/var/log', date: '2026-02-10' },
];
const LoadDB = () => {
  const { activeHost } = useSelector((state) => state.host);
  const { loadDB } = useSelector((state) => state.sidenav);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState(data);
  const [radio, setRadio] = useState(0);
  const [unloadList, setUnloadList] = useState([]);
  const [selectedUnload, setSelectedUnload] = useState("");
  const [checkBox, setCheckBox] = useState({});

  const columns = [
    {
      title: 'Load Type', // Just text in the header
      dataIndex: 'loadType',
      key: 'loadType',
      width: 120,
      render: (checked, record) => (
        <Checkbox
          // checked={checked}
          onChange={(e) => handleCheckboxTableChange(e.target.checked, record)}
        >{record.loadType}</Checkbox>
      ),
    },
    { title: 'Path', dataIndex: 'path', key: 'path' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];


  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const toYesNo = (val) => (val ? "yes" : "no");
      let loadObject = {}
      if(radio === 0){
        ["index", "schema", "object"].forEach(item => {
          const object = dataSource.find((res) => res.checked && (res.loadType === item));
         loadObject[item] = object ? object.path : "none";
        })
      }else{
        loadObject = {
          index: checkBox.index ?  values.index : "none",
          schema: checkBox.schema ?  values.schema : "none",
          object: checkBox.object ?  values.object : "none",
          trigger: checkBox.trigger ? values.trigger : "none",
        }
      }
      console.log(checkBox, values)
      const payload = {
        dbname: loadDB.node.dbname,
        ...loadObject,
        user: values.user,
        oiduse: toYesNo(checkBox.oiduse),
        statisticsuse: toYesNo(checkBox.statisticsuse),
        nolog: toYesNo(checkBox.nolog),
        period: checkBox.period ? values.period : "none",
        estimated: checkBox.estimated ? values.estimated : "none",
        errorcontrolfile: checkBox.errorcontrolfile ? values.errorcontrolfile : "none",
        ignoreclassfile: checkBox.ignoreclassfile ? values.ignoreclassfile : "none",
        checkoption: checkBox.checkoption ? "both" : "none",
      }

      dispatch(setBuffering(true))
      const response = await loadDBAPI(activeHost, payload)
        .finally(()=>{
          dispatch(setBuffering(false))
        })
        if(response.success){
          dispatch(setSuccessModal({open:true,
            title: "LoadDB",
            message: "Successfully loaded data"}))
          handleClose()
        }
    })
  };
  const handleCheckboxTableChange = (checked, record) => {

    const newData = dataSource.map((item) => {
      if (item.key === record.key) {
        return { ...item, checked};
      }
      return item;
    });
    setDataSource(newData);
  };
  const handleCheckBoxChange = (e) => {
    const {name, checked} = e.target;
    setCheckBox(prevState => ({...prevState, [name]: checked}));
  };

  const handleRadioButton = (e) => {
    setRadio(e)
  };

  const handleClose = () => {
    dispatch(setLoadDB({ open: false }));
    form.resetFields();
    setCheckBox({})
    setDataSource([])
  };

  const updateDataSource = (rawData) => {
    // 1. Get entries and filter out 'dbname'
    const convertedList = Object.entries(rawData)
      .filter(([key]) => key !== 'dbname')
      .map(([key, value]) => {
        // 2. Split path and date by the semicolon
        const [path, date] = value.split(';');

        return {
          loadType: key, // "object" or "schema"
          path: path,
          date: date,
          key: nanoid(4),
        };
      });
    setDataSource(convertedList);
  }

  useEffect(() => {
    if(loadDB.open){
      form.setFieldsValue({
        dbname: loadDB.node.dbname,
      })
      getUnloadDBAPI(activeHost).then((res) => {
        if(res.success){
          setUnloadList(res.result.database);
          if(res.result.database.length > 0){
            const selected = res.result.database[0].dbname
            setSelectedUnload(selected);
            form.setFieldValue("unload", selected)
            updateDataSource(res.result.database[0])
          }
        }
      })
    }
  }, [loadDB]);


  return (
    <Modal
      title="Load DB"
      open={loadDB.open}
      width={700}
      footer={() => {
        return (
          <>
            <Button type="primary" onClick={handleOk} style={{ marginRight: 8 }}>
              OK
            </Button>

            <Button
              type={'primary'}
              variant={'filled'}
              className={'button button__small'}
              onClick={() => handleClose()}
            >
              Close
            </Button>
          </>
        );
      }}
    >
      <div style={{ overflowY: 'auto' }}>
        <Form form={form} layout="horizontal">
          <div className={styles.db__layout}>
            <div className={'border__text'}>Database Information</div>

            <Row>
              <Col span={24}>
                <Form.Item labelCol={{ span: 7 }} name="dbname" label="Target database name: ">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 7 }}
                  name="user"
                  label="Username: "
                  rules={[{ required: true, message: 'required' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className={styles.db__layout}>
            <div className={'border__text'}>Unload Files</div>

            <Row>


              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 7 }}
                  name="unload"
                  label={<Radio checked={radio === 0} onChange={()=>handleRadioButton(0)}>
                    Custom Path</Radio>}

                >
                  <Select
                          onChange={(value)=>setSelectedUnload(value)}
                    options={unloadList.map((item) => ({value: item.dbname, label: item.dbname}))}
                  >
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <div className={radio === 1 ? "disabled": ""}>
                  <Table
                    bordered
                    pagination={false}
                    // rowSelection={{ type: 'checkbox', ...rowSelection }}
                    columns={columns}
                    dataSource={dataSource}
                  />
                </div>
                <Col span={24}>

                  <Form.Item>
                    <Radio checked={radio === 1} onChange={()=>handleRadioButton(1)} >
                      Unloaded file from:
                    </Radio>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <div className={radio === 0 ? "disabled": ""}>
                    <InputCheckBox
                      name={'schema'}
                      label={'Load schema'}
                      handleCheckBox={handleCheckBoxChange}
                    />
                    <InputCheckBox
                      name={'object'}
                      label={'Load object'}
                      handleCheckBox={handleCheckBoxChange}
                    />
                    <InputCheckBox
                      name={'index'}
                      label={'Load index'}
                      handleCheckBox={handleCheckBoxChange}
                    />
                    <InputCheckBox
                      name={'trigger'}
                      label={'Load trigger'}
                      handleCheckBox={handleCheckBoxChange}
                    />
                  </div>
                </Col>
              </Col>
            </Row>
          </div>
          <div className={styles.db__layout}>
            <div className={'border__text'}>Load Option</div>

            <Row>
              <Col span={24}>
                <Checkbox name={"checkoption"} onChange={handleCheckBoxChange}>check syntax and load database</Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox name={"nolog"} onChange={handleCheckBoxChange}>Don’t create log</Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox name={"oiduse"} onChange={handleCheckBoxChange}>Don't use OID</Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox name={"statisticsuse"} onChange={handleCheckBoxChange}>Don't update statistics</Checkbox>
              </Col>
              <InputCheckBox inputProps={{type: "number"}} name={"estimated"} label={"Estimated number of instances"} handleCheckBox={handleCheckBoxChange} />
              <InputCheckBox inputProps={{type: "number"}} name={"period"} label={"Insertion count for periodic commit"} handleCheckBox={handleCheckBoxChange} />
              <InputCheckBox name={"errorcontrolfile"} label={"Using error control file"} handleCheckBox={handleCheckBoxChange} />
              <InputCheckBox name={"ignoreclassfile"} label={"Ignored table file"} handleCheckBox={handleCheckBoxChange} />
            </Row>
          </div>

        </Form>
      </div>
    </Modal>
  );
};

export default LoadDB;
