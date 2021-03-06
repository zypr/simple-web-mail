import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { Card, Form, Button, Input, Icon } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getBadge } from '@/pages/Mails/MailBox';

import styles from './my.less';

const { Search } = Input;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ deleted, loading }) => ({
  deleted,
  loading: loading.models.deleted,
}))
@Form.create()
class DeleteView extends PureComponent {
  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: '来自',
      dataIndex: 'from',
    },
    {
      title: '标题',
      dataIndex: 'subject',
      render: (text, record) => (
        <span>
          {getBadge(record)}
          {record.hasFile && <Icon type="link" theme="outlined" style={{ marginRight: 10 }} />}
          {text}
        </span>
      ),
    },
    {
      title: '删除时间',
      dataIndex: 'dateTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => <Link to={`/mails/detail/Delete/${record.id}`}>详情</Link>,
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deleted/fetch',
    });
  }

  handleSearch = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deleted/fetch',
      payload: { s: value },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'deleted/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleDelete = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/remove',
      payload: { uid: mailUids, mailBox: 'Delete', delete: true },
    });
  };

  handleRetrieve = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/retrieve',
      payload: { uid: mailUids, mailBox: 'Delete' },
    });
  };

  render() {
    const { deleted, loading } = this.props;
    const { selectedRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Search
                placeholder="搜索邮件"
                onSearch={value => this.handleSearch(value)}
                style={{ width: 200, marginRight: 10 }}
              />
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={() => this.handleDelete()}>彻底删除</Button>
                  <Button onClick={() => this.handleRetrieve()}>恢复</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              rowKey="id"
              loading={loading}
              data={deleted}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DeleteView;
