import { Assignment, Resource, Event } from '@/models';
import { AllowedAPIResources } from '@types';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string, resource: AllowedAPIResources } }) {
    const resource = params.resource;

    if (resource === 'resources') {
        try {
            const resources = await Resource.findAll();

            return Response.json(
                resources
            );
        }
        catch (error) {
            return new Response(
                'Loading resources failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'events') {
        try {
            const events = await Event.findAll();

            return Response.json(
                events
            );
        }
        catch (error) {
            return new Response(
                'Loading events failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'assignments') {
        try {
            const assignments = await Assignment.findAll();

            return Response.json(
                assignments
            );
        }
        catch (error) {
            return new Response(
                'Loading assignments failed',
                {
                    status : 400
                }
            );
        }
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string, resource: AllowedAPIResources } }) {
    const resource = params.resource;
    const reqBody = await req.json();

    if (resource === 'resources') {
        try {
            const resource = await Resource.create(reqBody);
            return Response.json({
                data : resource.dataValues
            });
        }
        catch (error) {
            return new Response(
                'Creating resource failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'events') {
        try {
            const event = await Event.create(reqBody);
            return Response.json({
                data : event.dataValues
            });
        }
        catch (error) {
            return new Response(
                'Creating event failed',
                {
                    status : 400
                }
            );
        }
    }

    if (resource === 'assignments') {
        try {
            const assignment = await Assignment.create(reqBody);
            return Response.json({
                data : assignment.dataValues
            });
        }
        catch (error) {
            return new Response(
                'Creating assignment failed',
                {
                    status : 400
                }
            );
        }
    }
}
