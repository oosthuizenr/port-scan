import { checkPortRange } from './scanner'

// import { checkPort, checkPortRange } from './scanner'
// import PortStatus from './PortStatus';

// checkPort('127.0.0.1', 5037)
//     .then(result => {
//         console.log(PortStatus[result]);
//     })
//     .catch(err => {

//     });

    checkPortRange('127.0.0.1', 0, 65535)
    .then(result => {
    })
    .catch(err => {

    });