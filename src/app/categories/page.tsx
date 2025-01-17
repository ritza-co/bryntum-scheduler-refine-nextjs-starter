'use client';

import { useNavigation } from '@refinedev/core';
import { useTable } from '@refinedev/react-table';
import { ColumnDef, flexRender } from '@tanstack/react-table';
import React, { useCallback, useEffect, useRef } from 'react';

export default function CategoryList() {

    const { edit, show, create } = useNavigation();

    // 1. Store the navigation functions in refs, so we can ensure
    //    we always call the "current" version without re-creating
    //    the callbacks below.
    const editRef = useRef(edit);
    const showRef = useRef(show);

    // Whenever `edit` or `show` changes, update our refs.
    useEffect(() => {
        editRef.current = edit;
    }, [edit]);

    useEffect(() => {
        showRef.current = show;
    }, [show]);

    // 2. Create stable callbacks (no dependencies)
    const handleEdit = useCallback((resource: string, id: string) => {
        editRef.current(resource, id);
    }, []);

    const handleShow = useCallback((resource: string, id: string) => {
        showRef.current(resource, id);
    }, []);

    // 3. Define columns once, using only stable callback reference
    const columns = React.useMemo<ColumnDef<any>[]>(
        () => [
            {
                id          : 'id',
                accessorKey : 'id',
                header      : 'ID'
            },
            {
                id          : 'title',
                accessorKey : 'title',
                header      : 'Title'
            },
            {
                id          : 'actions',
                accessorKey : 'id',
                header      : 'Actions',
                cell        : function render({ getValue }) {
                    return (
                        <div
                            style={{
                                display       : 'flex',
                                flexDirection : 'row',
                                flexWrap      : 'wrap',
                                gap           : '4px'
                            }}
                        >
                            <button
                                onClick={() => {
                                    handleShow('categories', getValue() as string);
                                }}
                            >
                Show
                            </button>
                            <button
                                onClick={() => {
                                    handleEdit('categories', getValue() as string);
                                }}
                            >
                Edit
                            </button>
                        </div>
                    );
                }
            }
        ],
        [handleEdit, handleShow]
    );

    const {
        getHeaderGroups,
        getRowModel,
        setOptions,
        getState,
        setPageIndex,
        getCanPreviousPage,
        getPageCount,
        getCanNextPage,
        nextPage,
        previousPage,
        setPageSize
    } = useTable({
        columns
    });

    setOptions((prev) => ({
        ...prev,
        meta : {
            ...prev.meta
        }
    }));

    return (
        <div style={{ padding : '16px' }}>
            <div
                style={{
                    display        : 'flex',
                    alignItems     : 'center',
                    justifyContent : 'space-between'
                }}
            >
                <h1>List</h1>
                <button onClick={() => create('categories')}>Create</button>
            </div>
            <div style={{ maxWidth : '100%', overflowY : 'scroll' }}>
                <table>
                    <thead>
                        {getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {!header.isPlaceholder &&
                      flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                      )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop : '12px' }}>
                <button
                    onClick={() => setPageIndex(0)}
                    disabled={!getCanPreviousPage()}
                >
                    {'<<'}
                </button>
                <button onClick={() => previousPage()} disabled={!getCanPreviousPage()}>
                    {'<'}
                </button>
                <button onClick={() => nextPage()} disabled={!getCanNextPage()}>
                    {'>'}
                </button>
                <button
                    onClick={() => setPageIndex(getPageCount() - 1)}
                    disabled={!getCanNextPage()}
                >
                    {'>>'}
                </button>
                <span>
                    <strong>
                        {' '}
                        {getState().pagination.pageIndex + 1} / {getPageCount()}{' '}
                    </strong>
                </span>
                <span>
          | Go:{' '}
                    <input
                        type="number"
                        defaultValue={getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            setPageIndex(page);
                        }}
                    />
                </span>{' '}
                <select
                    value={getState().pagination.pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
              Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}