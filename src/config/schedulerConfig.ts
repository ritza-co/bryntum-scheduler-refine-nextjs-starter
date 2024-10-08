const schedulerConfig = {
    startDate                 : new Date(2024, 9, 1),
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    viewPreset                : 'hourAndDay',

    workingTime : {
        fromHour : 8,
        toHour   : 17
    },
    columns : [
        {
            type      : 'resourceInfo',
            text      : 'Name',
            field     : 'name',
            width     : 150,
            showImage : false
        }
    ]
};

export { schedulerConfig };
