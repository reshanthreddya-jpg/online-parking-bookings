const API_BASE = '/api';

export const api = {
  async getStats() {
    const res = await fetch(`${API_BASE}/analytics/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats');
    return json.data;
  },

  async getSlots(params = {}) {
    const query = new URLSearchParams();
    if (params.floor) query.append('floor', params.floor);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.slotType && params.slotType !== 'all') query.append('slotType', params.slotType);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/slots?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch slots');
    return json.data;
  },

  async getSlotById(id) {
    const res = await fetch(`${API_BASE}/slots/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch slot');
    return json.data;
  },

  async createSlot(slotData) {
    const res = await fetch(`${API_BASE}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create slot');
    return json.data;
  },

  async updateSlot(id, slotData) {
    const res = await fetch(`${API_BASE}/slots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update slot');
    return json.data;
  },

  async toggleMaintenance(id) {
    const res = await fetch(`${API_BASE}/slots/${id}/maintenance`, {
      method: 'PATCH'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to toggle maintenance');
    return json.data;
  },

  async deleteSlot(id) {
    const res = await fetch(`${API_BASE}/slots/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete slot');
    return json;
  },

  async checkIn(payload) {
    const res = await fetch(`${API_BASE}/parking/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Check-in failed');
    return json.data;
  },

  async calculateBill(payload) {
    const res = await fetch(`${API_BASE}/parking/calculate-bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to calculate bill');
    return json.data;
  },

  async checkOut(payload) {
    const res = await fetch(`${API_BASE}/parking/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Check-out failed');
    return json.data;
  },

  async reserveSlot(payload) {
    const res = await fetch(`${API_BASE}/parking/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Reservation failed');
    return json.data;
  },

  async cancelReservation(slotId) {
    const res = await fetch(`${API_BASE}/parking/cancel-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to cancel reservation');
    return json.data;
  },

  async getTickets(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/parking/tickets?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch tickets');
    return json.data;
  },

  async reseedData() {
    const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reseed database');
    return json;
  }
};
