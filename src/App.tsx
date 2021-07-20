import React from "react";
import {
  Form,
  Input,
  Icon,
  Button,
  TimePicker,
  Select,
  InputNumber,
  message
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import moment, { Moment } from "moment";

let id = 1;

class DynamicFieldSet extends React.Component<FormComponentProps> {
  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter((key) => key !== k)
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    let index = keys.length;
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes

    form.getFieldDecorator(`data[${index}]['startTime']`);
    form.getFieldDecorator(`data[${index}]['endTime']`);
    form.getFieldDecorator(`data[${index}]['state']`);

    form.setFieldsValue({
      keys: nextKeys,
      [`data[${index}]['startTime']`]: null,
      [`data[${index}]['endTime']`]: null,
      // [`data[${index}]['endTime']`]: moment("23:59", "HH:mm"),
      [`data[${index}]['state']`]: 0
      // [`data[${index - 1}]['endTime']`]: null,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let times = values.data.reduce((pre, d) => {
          return [...pre, [d.startTime, d.endTime]];
        }, []);
        if (isTimesOverlap(times)) {
          message.error("请确保各峰谷时段不重叠!");
          return;
        }
        console.log("Received values of form: ", values);
      }
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldValue,
      getFieldsValue
    } = this.props.form;

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 24, offset: 0 }
      }
    };
    getFieldDecorator("keys", {
      initialValue: []
    });
    const keys = getFieldValue("keys");
    const formItems = keys.map((k, index) => (
      <Form.Item
        className="m-0"
        {...formItemLayoutWithOutLabel}
        required={false}
        key={k}
      >
        <Form.Item className="inline-block">
          {getFieldDecorator(`data[${index}]['startTime']`, {
            initialValue: null,
            normalize: (value) => {
              if (!value) return value;
              return moment(value, "HH:mm");
            },
            rules: [
              {
                validator(rule, value, callback) {
                  let values = getFieldsValue();
                  if (!values.data[index].startTime) {
                    callback("请选择起始时间");
                  }
                  callback();
                }
              }
            ]
          })(<TimePicker format={"HH:mm"} />)}
        </Form.Item>

        <span className="ml-10 mr-10">至</span>

        <Form.Item className="m-0 inline-block">
          {getFieldDecorator(`data[${index}]['endTime']`, {
            initialValue: null,
            normalize: (value) => {
              if (!value) return value;
              return moment(value, "HH:mm");
            },
            rules: [
              {
                required: true,
                message: "请选择结束时间"
              },
              {
                validator: (rule, value, callback) => {
                  let values = this.props.form.getFieldsValue();
                  if (
                    values.data[index].startTime &&
                    values.data[index].endTime &&
                    values.data[index].endTime.isSameOrBefore(
                      values.data[index].startTime
                    )
                  ) {
                    callback("结束时间不能小于开始时间");
                  }
                  callback();
                }
              }
            ]
          })(<TimePicker format={"HH:mm"} />)}
        </Form.Item>

        {getFieldDecorator(`data[${index}]['state']`, { initialValue: 0 })(
          <Select className="ml-10" style={{ width: 100 }}>
            <Select.Option value={0}>峰</Select.Option>
            <Select.Option value={2}>谷</Select.Option>
            {/* <Select.Option value={1}>平</Select.Option> */}
          </Select>
        )}
        {
          <Icon
            className="dynamic-delete-button ml-10"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />
        }
      </Form.Item>
    ));
    return (
      <Form onSubmit={this.handleSubmit}>
        <div className="flex" style={{ width: "800px" }}>
          <fieldset
            className="mr-20"
            style={{
              width: "455px",
              border: "1px solid #dedede",
              padding: "10px"
            }}
          >
            <legend
              style={{ width: "auto", border: "none", marginBottom: "10px" }}
            >
              峰谷时段设置
            </legend>
            {formItems}
            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button
                type="dashed"
                onClick={this.add}
                style={{ width: "100%" }}
              >
                <Icon type="plus" /> 新增峰谷时段
              </Button>
            </Form.Item>
          </fieldset>

          <fieldset style={{ border: "1px solid #dedede", padding: "10px" }}>
            <legend
              style={{ width: "auto", border: "none", marginBottom: "10px" }}
            >
              金额设置
            </legend>
            <div>
              <span style={{ lineHeight: "40px", marginRight: "10px" }}>
                峰
              </span>
              <Form.Item className="inline-block">
                {getFieldDecorator(`price_0`, { initialValue: 0 })(
                  <InputNumber min={0} precision={4}></InputNumber>
                )}
              </Form.Item>
              <span style={{ marginLeft: "10px" }}>元</span>
            </div>
            <div>
              <span style={{ lineHeight: "40px", marginRight: "10px" }}>
                谷
              </span>
              <Form.Item className="inline-block">
                {getFieldDecorator(`price_2`, { initialValue: 0 })(
                  <InputNumber min={0} precision={4}></InputNumber>
                )}
              </Form.Item>
              <span style={{ marginLeft: "10px" }}>元</span>
            </div>
            <div>
              <span style={{ lineHeight: "40px", marginRight: "10px" }}>
                平
              </span>
              <Form.Item className="inline-block">
                {getFieldDecorator(`price_1`, { initialValue: 0 })(
                  <InputNumber min={0} precision={4}></InputNumber>
                )}
              </Form.Item>
              <span style={{ marginLeft: "10px" }}>元</span>
            </div>
          </fieldset>
        </div>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedDynamicFieldSet = Form.create({ name: "dynamic_form_item" })(
  DynamicFieldSet
);
// 用来测试用的
export default function Playground() {
  return <WrappedDynamicFieldSet />;
}

/**
 * 多个日期或时间之间是否重叠，请确保数据格式一致并有效
 * @param {Array} times
 * @param {Object} options
 * @param {String} options.format 不指定则认为检查数据为日期格式，其他格式 MM/DD、MM-DD、HH:mm、HH:mm:ss 将补全缺失的部分进行比较
 */
export function isTimesOverlap(
  times: [Moment, Moment][] | [string, string][],
  options?: { format?: "MM/DD" | "MM-DD" | "HH:mm" | "HH:mm:ss" }
) {
  if (!times || !Array.isArray(times) || times.length < 2) {
    return false;
  }

  let _options = Object.assign({}, options);

  let arr = times.map((item) => {
    let timeArr = [...item];
    switch (_options.format) {
      case "MM/DD":
        timeArr = [`2000/${item[0]}`, `2000/${item[1]}`];
        break;
      case "MM-DD":
        timeArr = [`2000-${item[0]}`, `2000-${item[1]}`];
        break;
      case "HH:mm":
      case "HH:mm:ss":
        timeArr = [`2000/01/01 ${item[0]}`, `2000/01/01 ${item[1]}`];
        break;
    }
    return [moment(timeArr[0]), moment(timeArr[1])];
  });

  for (var i = 0; i < arr.length; i++) {
    let begin = arr[i][0],
      end = arr[i][1];
    for (var j = i + 1; j < arr.length; j++) {
      let t_begin = arr[j][0],
        t_end = arr[j][1];
      // @see https://momentjs.com/docs/#/query/is-between/
      if (
        begin.isBetween(t_begin, t_end, undefined, "[]") ||
        t_begin.isBetween(begin, end, undefined, "[]")
      )
        return true;
    }
  }
  return false;
}
