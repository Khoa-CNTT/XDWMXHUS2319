// typingReducer.js

// Actions
const SET_TYPING = "SET_TYPING";
const CLEAR_TYPING = "CLEAR_TYPING";

// Action Creators
export const setTyping = (conversationId, friendId) => ({
  type: SET_TYPING,
  payload: { conversationId, friendId },
});

export const clearTyping = (conversationId) => ({
  type: CLEAR_TYPING,
  payload: conversationId,
});

// Reducer
const initialState = {};

const typingReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TYPING:
      return {
        ...state,
        [action.payload.conversationId]: action.payload.friendId,
      };
    case CLEAR_TYPING:
      const { [action.payload]: _, ...rest } = state;
      return rest;
    default:
      return state;
  }
};

export default typingReducer;
