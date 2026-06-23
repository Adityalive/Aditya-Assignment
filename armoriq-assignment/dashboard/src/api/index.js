import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL || "",
});

export const getRules = () => api.get("/api/rules");
export const createRule = (data) => api.post("/api/rules", data);
export const deleteRule = (id) => api.delete(`/api/rules/${id}`);
export const toggleRule = (id) => api.patch(`/api/rules/${id}/toggle`);
export const getLogs = (convId) =>
  api.get("/api/logs", { params: { conversationId: convId } });
export const getTools = () => api.get("/api/tools");
export const sendChat = (message, conversationId) =>
  api.post("/api/chat", { message, conversationId });
export const getChatSessions = () => api.get("/api/chat");
export const getChatHistory = (id) => api.get(`/api/chat/${id}`);
export const deleteChatSession = (id) => api.delete(`/api/chat/${id}`);
export const getNotes = () => api.get("/api/notes");

// Budget API
export const getBudgetSettings = () => api.get("/api/budget/settings");
export const setBudgetSettings = (budget) => api.post("/api/budget/settings", { budget });
export const getBudgetUsage = () => api.get("/api/budget/usage");
export const getConversationUsage = (conversationId) => api.get(`/api/budget/usage/${conversationId}`);
export const resetConversationUsage = (conversationId) => api.delete(`/api/budget/usage/${conversationId}`);

// Integrations
export const getIntegrations = () => api.get("/api/integrations").then(res => res.data);
export const saveIntegration = (data) => api.post("/api/integrations", data).then(res => res.data);
export const deleteIntegration = (provider) => api.delete(`/api/integrations/${provider}`).then(res => res.data);
