'use client';

import { useList } from '@refinedev/core';

export default function Events() {
    const { data } = useList({
        resource : 'events'
    });

    return (
        <div style={{ height : '100vh', padding : '1rem' }}>
            <h1>Events</h1>
            <ul style={{ padding : '1rem' }}>
                {data?.data?.map((event) => (
                    <li key={event.id}>
                        {event.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
