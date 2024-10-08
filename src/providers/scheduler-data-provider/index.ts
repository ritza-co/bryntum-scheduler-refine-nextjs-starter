'use client';

import type { DataProvider } from '@refinedev/core';

const API_URL = 'http://localhost:3000/api';

export const schedulerDataProvider: DataProvider = {
    getList : async({ resource }) => {
        const response = await fetch(`${API_URL}/${resource}`);

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.json();

        return {
            data,
            total : data.length
        };
    },
    create : async({ resource, variables }) => {
        const response = await fetch(`${API_URL}/${resource}`, {
            method  : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(variables)
        });

        if (response.status < 200 || response.status > 299) throw response;

        return await response.json();
    },
    deleteOne : async({ resource, id, variables }) => {
        const response = await fetch(`${API_URL}/${resource}/${id}`, {
            method : 'DELETE'
        });

        if (response.status < 200 || response.status > 299) throw response;

        return await response.json();
    },
    update : async({ resource, id, variables }) => {
        const response = await fetch(`${API_URL}/${resource}/${id}`, {
            method  : 'PATCH',
            body    : JSON.stringify(variables),
            headers : {
                'Content-Type' : 'application/json'
            }
        });

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.json();

        return { data };
    },
    getOne : () => {
        throw new Error('Not implemented');
    },
    getApiUrl : () => API_URL
};