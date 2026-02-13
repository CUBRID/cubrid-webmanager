import { Checkbox, Col, Form, Input, Row } from 'antd';
import React from 'react';


const InputCheckBox = ({name, label, handleCheckBox, inputProps})=>{
  const [checked, setChecked] = React.useState(false);


  const handleCheck = (e)=>{
    setChecked(e.target.checked);
    handleCheckBox(e)
  }

  return (
    <Col span={24}>
      <Row>
        <Col span={10}>
          <Checkbox name={name} onChange={handleCheck}>{label}</Checkbox>
        </Col>
        <Col span={14}>
          <Form.Item name={name}
                     rules={[{required:checked, message: "required"}]}
          >
            <Input {...inputProps} disabled={!checked}/>
          </Form.Item>
        </Col>
      </Row>
    </Col>
  )
}


export default InputCheckBox;