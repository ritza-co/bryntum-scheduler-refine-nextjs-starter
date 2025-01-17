'use client';
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { useEffect, useMemo, useRef } from 'react';
import '@bryntum/scheduler/scheduler.stockholm.css';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { ResourceModel, EventModel, AssignmentModel, Grid, Store, Model } from '@bryntum/scheduler';

interface SyncData {
  source: Grid;
  store: Store;
  action: 'remove' | 'removeAll' | 'add' | 'clearchanges' | 'filter' | 'update' | 'dataset' | 'replace';
  records: Model[];
  changes: object;
  }[];

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

    const syncData = ({ store, action, records }: SyncData) => {
        const storeId = store.id;
        if (storeId === 'resources') {
            if (action === 'add') {
                const resourcesIds = resources.map((obj) => obj.id);
                for (let i = 0; i < records.length; i++) {
                    const record = records[i] as ResourceModel;
                    const recordData = (record as any).data as ResourceModel;
                    const resourceExists = resourcesIds.includes(recordData.id);
                    if (resourceExists) return;
                    const { id, ...newResource } = recordData as ResourceModel;
                    mutateCreate({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        values           : newResource
                    });
                }
            }
            if (action === 'remove') {
                const record = records[0] as ResourceModel;
                const recordData = (record as any).data as ResourceModel;
                if (`${recordData?.id}`.startsWith('_generated')) return;
                records.forEach((rec) => {
                    mutateDelete({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        id               : rec.id
                    });
                });
            }
            if (action === 'update') {
                for (let i = 0; i < records.length; i++) {
                    const record = records[i] as ResourceModel;
                    const recordData = (record as any).data as ResourceModel;
                    if (`${records[i].id}`.startsWith('_generated')) return;
                    const modifiedVariables = (records[i] as any).meta
                        .modified as Writable<Partial<ResourceModel>>;
                    (Object.keys(modifiedVariables) as Array<keyof ResourceModel>).forEach(
                        (key) => {
                            modifiedVariables[key] = (recordData)[
                                key
                            ];
                        }
                    );

                    mutateUpdate({
                        resource         : 'resources',
                        dataProviderName : 'scheduler',
                        id               : recordData.id,
                        values           : {
                            ...modifiedVariables
                        }
                    });
                }
            }
        }
        if (storeId === 'events') {
            if (action === 'remove') {
                const record = records[0] as ResourceModel;
                const recordData = (record as any).data as ResourceModel;
                if (`${recordData?.id}`.startsWith('_generated')) return;
                records.forEach((rec) => {
                    mutateDelete({
                        resource         : 'events',
                        dataProviderName : 'scheduler',
                        id               : rec.id
                    });
                });
            }
            if (action === 'update') {
                if (disableCreate) return;
                for (let i = 0; i < records.length; i++) {
                    const record = records[0] as EventModel;
                    const recordData = (record as any).data as EventModel;
                    if (`${recordData.id}`.startsWith('_generated')) {
                        const eventsIds = events.map((obj) => obj.id);
                        for (let i = 0; i < records.length; i++) {
                            const eventExists = eventsIds.includes(recordData.id);
                            if (eventExists) return;
                            const { id, ...newEvent } = recordData as EventModel;
                            // get current resource
                            const resourceId = (schedulerRef?.current?.instance?.selectedRecords[0] as any).data.id;
                            mutateCreate({
                                resource         : 'events',
                                dataProviderName : 'scheduler',
                                values           : newEvent
                            }, {
                                onSuccess : ({ data }) => {
                                    return mutateCreate({
                                        resource         : 'assignments',
                                        dataProviderName : 'scheduler',
                                        values           : { eventId : data.id, resourceId }
                                    }, {
                                        onSuccess : (response) => {
                                            console.log('Assignment created:', response);
                                        },
                                        onError : (error) => {
                                            console.error('Error creating assignment:', error);
                                        }
                                    });
                                },
                                onError : (error) => {
                                    console.error('Error creating event:', error);
                                },
                                onSettled : () => {
                                    // Handle completion regardless of success/failure
                                    console.log('Event creation settled');
                                }
                            });
                        }
                    }
                    else {
                        const modifiedVariables = (records[i] as any).meta
                            .modified as Writable<Partial<EventModel>>;
                        (Object.keys(modifiedVariables) as Array<keyof EventModel>).forEach(
                            (key) => {
                                modifiedVariables[key] = (recordData)[
                                    key
                                ];
                            }
                        );

                        mutateUpdate({
                            resource         : 'events',
                            dataProviderName : 'scheduler',
                            id               : recordData.id,
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
                    const record = records[0] as AssignmentModel;
                    const recordData = (record as any).data as AssignmentModel;
                    const assignmentExists = assignmentIds.includes(recordData.id);
                    if (assignmentExists) return;
                    if (disableCreate) return;
                    const { eventId, resourceId } = recordData as AssignmentModel;
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
                    const record = records[0] as AssignmentModel;
                    const recordData = (record as any).data as AssignmentModel;
                    if (`${recordData.id}`.startsWith('_generated')) return;
                    mutateUpdate({
                        resource         : 'assignments',
                        dataProviderName : 'scheduler',
                        id               : recordData.id,
                        values           : {
                            eventId    : recordData.eventId,
                            resourceId : recordData.resourceId
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
