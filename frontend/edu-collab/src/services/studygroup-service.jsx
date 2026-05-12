import apiClient from "../api/api-client";

export const createGroup = (data)=>{
    return apiClient.post("/study-groups",data);
};

export const getGroupById = (id)=>{
    return apiClient.get(`/study-groups/${id}`);
};

export const getGroupByLocation = (location)=>{
    return apiClient.get(`/study-groups/location?location=${location}`);
};

export const getGroupBySubject = (subject)=>{
    return apiClient.get(`/study-groups/subject?subject=${subject}`);
};

export const getGroupByMeetingTime = (meetingTime)=>{
    return apiClient.get(`/study-groups/meetingTime?meetingTime=${meetingTime}`);
};

export const deleteGroupById = (id)=>{
    return apiClient.delete(`/study-groups/${id}`);
};

export const joinGroup = (data)=>{
    return apiClient.post("/study-groups/join",data);
};