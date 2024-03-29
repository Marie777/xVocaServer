


//Delay func
const delay = (ms) => {
    return new Promise( (resolve, reject) => {
        setTimeout(resolve, ms);
    });
};

export {delay};
