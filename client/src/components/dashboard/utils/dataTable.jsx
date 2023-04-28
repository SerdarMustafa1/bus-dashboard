import React, { Component } from 'react';
import './css/jquery.dataTables.min.css';
import './css/dataTables.bootstrap4.min.css';
import 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';

import { translate } from 'react-i18next';

const $ = require('jquery');
$.DataTable = require('datatables.net');


class DataTable extends Component {

    componentWillUnmount() {
        // if (this.$table) this.$table.destroy(true);
    }

    async componentDidMount() {
        await Promise.all(this.props.columns.map(col => col.load ? col.load(this.arrayToObject) : ''));
        const { t } = this.props;

        let token = sessionStorage.getItem("_t") || localStorage.getItem("_t");

        this.$table = $(this.el).DataTable({
            order: this.props.order,
            data: this.props.data,
            ajax: !this.props.data ? {
                url: this.props.ajax,
                type: 'GET',
                beforeSend: function (request) {
                    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
                }
            } : undefined,
            columns: this.props.columns,
            rowCallback: this.props.rowCallback,
            responsive: true,
            language: {
                lengthMenu:     t('dataTable.lengthMenu'),
                zeroRecords:    t('dataTable.zeroRecords'),
                info:           t('dataTable.info'),
                infoEmpty:      t('dataTable.infoEmpty'),
                infoFiltered:   t('dataTable.infoFiltered'),
                search:         t('dataTable.search'),
                loadingRecords: t('dataTable.loadingRecords'),
                processing:     t('dataTable.processing'),
                thousands:      t('dataTable.thousands'),
                paginate: {
                    first:    t('dataTable.paginate.first'),
                    last:     t('dataTable.paginate.last'),
                    next:     t('dataTable.paginate.next'),
                    previous: t('dataTable.paginate.previous')
                },
            }
        });

        if (this.props.setRefresh) this.props.setRefresh(this.$table.ajax.reload)
    }

    arrayToObject = (array, keyField) =>
        array.reduce((obj, item) => {
        obj[item[keyField]] = item;
        return obj }, {});

    render() {
        return (
            <table className="display" width="100%" ref={el=> {this.el = el}}>
                <thead>
                    <tr>
                        {this.props.thead.map(name => <th key={name}>{name}</th>)}
                    </tr>
                </thead>
            </table>
        )
    }
}


export default translate()(DataTable);