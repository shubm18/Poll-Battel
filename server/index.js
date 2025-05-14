const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

wss.on('connection', (ws) => {
  let currentRoom = null;
  let currentUser = null;

  console.log(' New WebSocket connection established');

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid JSON format' } }));
      return;
    }

    const { type, payload } = data;

    switch (type) {
      case 'create_room': {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
          users: [{
            username: payload.username,
            avatar: payload.avatar,
            socket: ws,
          }],
          polls: [],
        };
        currentRoom = roomCode;
        currentUser = payload.username;
        ws.send(JSON.stringify({
          type: 'room_created',
          payload: { roomCode },
        }));
        break;
      }

      case 'join_room': {
        const room = rooms[payload.roomCode];
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Room not found' } }));
          return;
        }

        if (room.users.find(user => user.username === payload.username)) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Username already taken' } }));
          return;
        }

        currentRoom = payload.roomCode;
        currentUser = payload.username;
        room.users.push({
          username: payload.username,
          avatar: payload.avatar,
          socket: ws,
        });

        const latestPoll = room.polls[room.polls.length - 1] || null;

        room.users.forEach(user => {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
              type: 'room_joined',
              payload: {
                roomCode: currentRoom,
                users: room.users.map(u => ({
                  username: u.username,
                  avatar: u.avatar,
                })),
                poll: latestPoll && latestPoll.active
                  ? {
                      question: latestPoll.question,
                      options: latestPoll.options,
                      results: latestPoll.results,
                      startTime: latestPoll.startTime,
                      active: latestPoll.active,
                    }
                  : null,
              },
            }));
          }
        });

        break;
      }

      case 'start_poll': {
        const room = rooms[currentRoom];
        if (!room) return;
        const poll = {
          question: payload.question,
          options: payload.options,
          results: Array(payload.options.length).fill(0),
          active: true,
          timeRemaining: 60,
          startTime: Date.now(),
        };
        room.polls.push(poll);

        room.users.forEach(user => {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
              type: 'poll_started',
              payload: {
                question: poll.question,
                options: poll.options,
                timeRemaining: poll.timeRemaining,
                startTime: poll.startTime,
              },
            }));
          }
        });

        const timerInterval = setInterval(() => {
          if (poll.timeRemaining > 0) {
            poll.timeRemaining--;
            room.users.forEach(user => {
              if (user.socket.readyState === WebSocket.OPEN) {
                user.socket.send(JSON.stringify({
                  type: 'timer_update',
                  payload: { timeRemaining: poll.timeRemaining },
                }));
              }
            });
          } else {
            poll.active = false;
            clearInterval(timerInterval);
            const maxVotes = Math.max(...poll.results);
            const winner = poll.options[poll.results.indexOf(maxVotes)] || null;
            room.users.forEach(user => {
              if (user.socket.readyState === WebSocket.OPEN) {
                user.socket.send(JSON.stringify({
                  type: 'poll_ended',
                  payload: {
                    results: poll.results,
                    winner,
                  },
                }));
              }
            });
          }
        }, 1000);
        break;
      }

      case 'vote': {
        const room = rooms[currentRoom];
        if (!room) return;
        const poll = room.polls[room.polls.length - 1];
        if (!poll || !poll.active) return;

        const index = payload.optionIndex;
        if (typeof index === 'number' && index >= 0 && index < poll.options.length) {
          poll.results[index]++;
        }

        room.users.forEach(user => {
          if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
              type: 'vote_update',
              payload: { results: poll.results },
            }));
          }
        });

        break;
      }

      case 'leave_room': {
        const room = rooms[currentRoom];
        if (!room) return;
        room.users = room.users.filter(user => user.username !== currentUser);
        if (room.users.length === 0) {
          delete rooms[currentRoom];
        }
        break;
      }

      default:
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }));
    }
  });

  ws.on('close', () => {
    const room = rooms[currentRoom];
    if (!room) return;
    room.users = room.users.filter(user => user.username !== currentUser);
    if (room.users.length === 0) {
      delete rooms[currentRoom];
    }
  });
});

console.log('✅ WebSocket server running at ws://localhost:8080');
