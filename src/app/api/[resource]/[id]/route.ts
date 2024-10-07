import { Assignment, Event, Resource } from '@/models';
import { AllowedAPIResources } from '@types';
import { NextRequest } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: { id: string, resource: AllowedAPIResources } }) {
    const resource = params.resource;
    const id = params.id;

    if (resource === 'resources') {
        try {
            await Resource.destroy({ where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response('Deleting resource failed', {
                status : 400
            });
        }
    }

    if (resource === 'events') {
        try {
            await Event.destroy({ where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response('Deleting event failed', {
                status : 400
            });
        }
    }

    if (resource === 'assignments') {
        try {
            await Assignment.destroy({ where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response('Deleting assignment failed', {
                status : 400
            });
        }
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, resource: AllowedAPIResources } }) {
    const resource = params.resource;
    const id = params.id;
    const reqBody = await req.json();

    if (resource === 'resources') {
        try {
            Resource.update(reqBody, { where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response(
                'Updating resource failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'events') {
        try {
            Event.update(reqBody, { where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response(
                'Updating event failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'assignments') {
        try {
            Assignment.update(reqBody, { where : { id } });
            return Response.json({ success : true });
        }
        catch (error) {
            return new Response(
                'Updating assignment failed',
                {
                    status : 400
                }
            );
        }
    }
}