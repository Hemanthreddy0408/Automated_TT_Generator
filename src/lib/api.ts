const API_BASE_URL = "http://localhost:8080";

export const getRooms = async () => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`);
  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRoom = async (room: any) => {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });
  return res.json();
};
