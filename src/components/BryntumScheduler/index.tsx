'use client';
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { useEffect, useMemo, useRef } from 'react';
import '@bryntum/scheduler/scheduler.stockholm.css';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { ResourceModel, EventModel, AssignmentModel } from '@bryntum/scheduler';

type SyncData = {
  action: 'dataset' | 'add' | 'remove' | 'update' | 'removeAll' | 'clearchanges' | 'filter' | 'replace';
  records: {
    data: ResourceModel | EventModel | AssignmentModel;
    meta: {
      modified: Partial<ResourceModel> | Partial<EventModel> | Partial<AssignmentModel>;
    };
  }[];
  store: {
    id: 'resources' | 'events' | 'assignments';
  };
  changes: object;
};

type Writable<T> = { -readonly [K in keyof T]: T[K] };

export default function Scheduler({ ...props }) {

    const
        { data: dataResources } = useList({
            resource         : 'resources',
            dataProviderName : 'scheduler'
        }),
        { data: dataEvents } = useList({
            resource         : 'events',
            dataProviderName : 'scheduler'
        }),
        { data: dataAssignments } = useList({
            resource         : 'assignments',
            dataProviderName : 'scheduler'
        });

    const
        { mutate: mutateCreate } = useCreate(),
        { mutate: mutateDelete } = useDelete(),
        { mutate: mutateUpdate } = useUpdate();

    const schedulerRef = useRef<BryntumScheduler>(null);

    let disableCreate = false;

    function onBeforeDragCreate() {
        disableCreate = true;
    }
    function onAfterDragCreate() {
        disableCreate = false;
    }

    const syncData = ({ store, action, records, changes }: SyncData) => {
        const storeId = store.id;
        if (storeId === 'resources') {
            if (action === 'add') {
                const resourcesIds = resources.map((obj) => obj.id);
                for (let i = 0; i < records.length; i++) {
                    const resourceExists = resourcesIds.includes(records[i].data.id);
                    if (resourceExists) return;
                    const { id, ...newResource } = records[i].data as ResourceModel;
                    mutateCreate({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        values           : newResource
                    });
                }
            }
            if (action === 'remove') {
                if (`${records[0]?.data?.id}`.startsWith('_generated')) return;
                records.forEach((record) => {
                    mutateDelete({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        id               : record.data.id
                    });
                });
            }
            if (action === 'update') {
                for (let i = 0; i < records.length; i++) {
                    if (`${records[i].data.id}`.startsWith('_generated')) return;
                    const modifiedVariables = records[i].meta
                        .modified as Writable<Partial<ResourceModel>>;
                    (Object.keys(modifiedVariables) as Array<keyof ResourceModel>).forEach(
                        (key) => {
                            modifiedVariables[key] = (records[i].data as ResourceModel)[
                                key
                            ] as any;
                        }
                    );

                    mutateUpdate({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        id               : records[i].data.id,
                        values           : {
                            ...modifiedVariables
                        }
                    });
                }
            }
        }
        if (storeId === 'events') {
            if (action === 'remove') {
                if (`${records[0]?.data?.id}`.startsWith('_generated')) return;
                records.forEach((record) => {
                    mutateDelete({
                        resource         : 'events',
                        dataProviderName : 'scheduler',
                        id               : record.data.id
                    });
                });
            }
            if (action === 'update') {
                if (disableCreate) return;
                for (let i = 0; i < records.length; i++) {
                    if (`${records[i].data.id}`.startsWith('_generated')) {
                        const eventsIds = events.map((obj) => obj.id);
                        for (let i = 0; i < records.length; i++) {
                            const eventExists = eventsIds.includes(records[i].data.id);
                            if (eventExists) return;
                            const { id, ...newEvent } = records[i].data as EventModel;
                            // get current resource
                            const resourceId = schedulerRef?.current?.instance?.selectedRecords[0].data.id;
                            mutateCreate({
                                resource         : 'events',
                                dataProviderName : 'scheduler',
                                values           : newEvent
                            }, {
                                onSuccess : ({  data }) => {
                                    mutateCreate({
                                        resource         : 'assignments',
                                        dataProviderName : 'scheduler',
                                        values           : { eventId : data.id, resourceId }
                                    });
                                }
                            });
                        }
                    }
                    else {
                        const modifiedVariables = records[i].meta
                            .modified as Writable<Partial<EventModel>>;
                        (Object.keys(modifiedVariables) as Array<keyof EventModel>).forEach(
                            (key) => {
                                modifiedVariables[key] = (records[i].data as EventModel)[
                                    key
                                ] as any;
                            }
                        );

                        mutateUpdate({
                            resource         : 'events',
                            dataProviderName : 'scheduler',
                            id               : records[i].data.id,
                            values           : {
                                ...modifiedVariables
                            }
                        });
                    }
                }
            }
        }
        if (storeId === 'assignments') {
            if (action === 'add') {
                const assignmentIds = assignments.map((obj) => obj.id);
                for (let i = 0; i < records.length; i++) {
                    const assignmentExists = assignmentIds.includes(records[i].data.id);
                    if (assignmentExists) return;
                    if (disableCreate) return;
                    const { eventId, resourceId } = records[i].data as AssignmentModel;
                    if (`${eventId}`.startsWith('_generated') || `${resourceId}`.startsWith('_generated')) return;
                    mutateCreate({
                        resource         : 'assignments',
                        dataProviderName : 'scheduler',
                        values           : { eventId, resourceId }
                    });
                }
            }
            if (action === 'update') {
                for (let i = 0; i < records.length; i++) {
                    if (`${records[i].data.id}`.startsWith('_generated')) return;
                    mutateUpdate({
                        resource         : 'assignments',
                        dataProviderName : 'scheduler',
                        id               : records[i].data.id,
                        values           : {
                            eventId    : (records[i].data as AssignmentModel).eventId,
                            resourceId : (records[i].data as AssignmentModel).resourceId
                        }
                    });
                }
            }
        }
    };

    useEffect(() => {
    // Bryntum Scheduler instance
        const scheduler = schedulerRef?.current?.instance;
    }, []);

    const
        events = useMemo(() => dataEvents?.data || [], [dataEvents]),
        assignments = useMemo(() => dataAssignments?.data || [], [dataAssignments]),
        resources = useMemo(() => dataResources?.data || [], [dataResources]);

    return (
        <div id="app">
            <BryntumScheduler
                ref={schedulerRef}
                events={events}
                assignments={assignments}
                resources={resources}
                onDataChange={syncData}
                onBeforeDragCreate={onBeforeDragCreate}
                onAfterDragCreate={onAfterDragCreate}
                {...props}
            />
        </div>
    );
}
