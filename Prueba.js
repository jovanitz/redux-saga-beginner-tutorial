export Prueba default (state = {data: [], loading: false}, action = {}) => {
  switch (action.type) {
    case 'RECORDS/FETCH':
    case 'RECORDS/FETCH_FAILED':
      return {
          ...state,
          loading: true,
          data: []
      };
    case 'RECORDS/SET':
      return {
          ...state,
          loading: false,
          data: action.payload
      };
    default:
      return state;
  }
};
