import client from './client.js'

export const getResources = () => client.get('/resources').then(({ data }) => data || [])

export const createResource = (payload) => client.post('/resources', payload).then(({ data }) => data)

export const updateResource = (id, payload) => client.put(`/resources/${id}`, payload).then(({ data }) => data)

export const deleteResource = (id) => client.delete(`/resources/${id}`)
