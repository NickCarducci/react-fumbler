import firebase from ".././init-firebase";
import rsa from "js-crypto-rsa";
const standardCatch = (err) => console.log(err.message);
const arrayMessage = (message) =>
  message
    .toLowerCase()
    //capture or, excluding set, match 2 or more of the preceding token
    .replace(/((\r\n|\r|\n)+[^a-zA-Z]+_+[ ]{2,})+/g, " ")
    .split(" ");
const specialFormatting = (x, numbersOk) =>
  x
    .toLowerCase()
    //replace or regex a-z or A-Z includes space whitespace
    .replace(!numbersOk ? /[^a-zA-Z,']+/g : /[^a-zA-Z0-9,']+/g, " ")
    .split(" ")
    .map((word) => {
      var end = word.substring(1);
      if (word.includes(`'`)) {
        var withapos = word.lastIndexOf(`'`);
        var beginning = word.substring(1, withapos);
        if (beginning.length === 1) {
          end =
            beginning +
            `'` +
            word.charAt(withapos + 1).toUpperCase() +
            word.substring(withapos + 2);
        }
      }
      var resword = word.charAt(0).toUpperCase() + end;
      return ["Of", "And", "The"].includes(resword)
        ? resword.toLowerCase()
        : arrayMessage(resword).join(" ");
    })
    .join(" ");
const castBox = async (deviceBox, deviceName, auth, userDatas, devices) =>
  await userDatas
    .doc(auth.uid)
    .update({
      pendingDeviceBoxes: firebase.firestore.FieldValue.arrayUnion(
        deviceBox.box
      )
    })
    .then(
      async () =>
        await devices
          .add({
            authorId: auth.uid,
            box: deviceBox.box,
            name: deviceName
          })
          .then(() => "awaitingAuthMode")
          .catch(standardCatch)
    )
    .catch(standardCatch);

const getKeys = async (
  deviceBox,
  accountBox,
  user,
  rsaPrivateKeys,
  auth,
  ud, //userdata doc
  devices,
  userDatas
) => {
  if (user["deviceBox" + deviceBox.box]) {
    rsaPrivateKeys
      .setPrivateKey({
        _id: auth.uid,
        key: user["deviceBox" + deviceBox.box],
        box: user.box
      })
      .then(
        async () =>
          await ud
            .update({
              pendingDeviceBoxes: firebase.firestore.FieldValue.arrayRemove(
                accountBox.box
              ),
              ["deviceBox" +
              deviceBox.box]: firebase.firestore.FieldValue.delete()
            })
            .then(
              async () =>
                await devices
                  .where("authorId", "==", auth.uid)
                  .where("box", "==", deviceBox.box)
                  .get()
                  .then((querySnapshot) => {
                    let foos = [];
                    let p = 0;
                    querySnapshot.docs.forEach((doc) => {
                      p++;
                      if (doc.exists) {
                        var foo = doc.data();
                        foo.id = doc.id;
                        foos.push(foo);
                      }
                    });
                    return (
                      querySnapshot.docs.length === p &&
                      devices
                        .doc(foos[foos.length].id)
                        .update({
                          authorized: true
                        })
                        .catch(standardCatch)
                    );
                  })
                  .catch(standardCatch)
            )
            .catch(standardCatch)
      );
  } else
    await castBox(
      deviceBox,
      window.prompt(`give us a name for this device`),
      auth,
      userDatas,
      devices
    ); //this shouldn't run unless interrupted
};
const saveDevice = async (user, auth, rsaPrivateKeys, deviceName, users) =>
  await rsa
    .generateKey(2048)
    .then(
      async (accountBox) =>
        await rsaPrivateKeys
          .setPrivateKey({
            _id: user.box ? "device" : auth.uid,
            key: accountBox.key,
            box: accountBox.box
          })
          .then(async () => {
            //with device-box, get account-key
            if (!user.box)
              //totally new account-box & device-box (same for first device)
              users
                .doc(auth.uid)
                .update({ box: accountBox.box }) //keys are only on device
                .then(() =>
                  window.alert(
                    "Establishing an original keybox for your account... success!  " +
                      "Now you can copy this to access on-device, end-to-end encrypted chats"
                  )
                )
                .catch(standardCatch);
            return await castBox(
              accountBox,
              specialFormatting(deviceName),
              auth,
              user
            );

            //randomString(4, "aA#")
          })
          .catch(standardCatch)
    )
    .catch(standardCatch);

const getDevices = async (user, ud, accountBox, devices) =>
  await Promise.all(
    user.pendingDeviceBoxes &&
      user.pendingDeviceBoxes.length > 0 &&
      user.pendingDeviceBoxes.map(
        async (deviceBox) =>
          await ud
            .update({
              pendingDeviceBoxes: firebase.firestore.FieldValue.arrayRemove(
                accountBox.box
              ),
              ["deviceBox" + deviceBox]: rsa.encrypt(
                accountBox.key,
                deviceBox,
                "SHA-256",
                {
                  name: "RSA-PSS"
                }
              )
            })
            .then(() => "string only")
            .catch(standardCatch)
      )
  )
    .then(
      async () =>
        //hydrate keys
        (async (keyBoxes, auth, rsaPrivateKeys) =>
          await devices
            .where("authorId", "==", auth.uid)
            .get()
            .then((querySnapshot) => {
              let devices = [];
              let p = 0;
              querySnapshot.docs.forEach((doc) => {
                p++;
                if (doc.exists) {
                  var dev = doc.data();
                  dev.id = doc.id;
                  dev.thisdevice = keyBoxes.find(
                    (x) => x._id === "device" && x.box === dev.box
                  );
                  if (!dev.decommissioned) {
                    devices.push(dev);
                  } else {
                    var keybox = keyBoxes.find((x) => x.box === dev.box);
                    if (keybox)
                      rsaPrivateKeys.deleteKey(keybox).catch(standardCatch);
                  }
                }
              });
              if (querySnapshot.docs.length === p) {
                return devices;
              }
            })
            .catch(standardCatch)) && devices
    )
    .catch(standardCatch);

export const fumbler = async (
  auth,
  user,
  rsaPrivateKeys,
  userDatas,
  users,
  devices
) =>
  await rsaPrivateKeys
    .readPrivateKeys()
    .then(async (keysOutput) => {
      const keyBoxes = Object.values(keysOutput);
      if (keyBoxes) {
        const ud = userDatas.doc(auth.uid);
        const accountBox = keyBoxes.find((x) => x._id === auth.uid);
        if (accountBox) {
          //user keyBox found (locally), and useable. Everytime, salt the
          //account-key stored on device for all pendingDeviceBoxes
          //syncPending
          return await getDevices(
            user,
            ud,
            accountBox,
            devices
            //keyBoxes,
            //auth,
            //rsaPrivateKeys
          )
            //async await require stringify? if already then'd,
            //it is already object
            .then((devices) => {
              return {
                accountBox,
                fumblingComplete: true,
                devices
              };
            })
            .catch(standardCatch);
        } else {
          const deviceBox = keyBoxes.find((x) => x._id === "device");
          if (deviceBox) {
            //no user keyBox found (locally), but device-box has been
            //provisioned/forged (locally). Next,
            getKeys(
              deviceBox,
              accountBox,
              user,
              rsaPrivateKeys,
              auth,
              ud,
              devices
            );
            return null;
          } else {
            //no user, nor device keyBox, found
            const deviceName = window.prompt(`give us a name for this device`);
            if (deviceName) {
              saveDevice(
                user,
                auth,
                rsaPrivateKeys,
                deviceName,
                users,
                userDatas
              );
            }
            return null;
          }
          //
        }
      } else return null;
    })
    .catch(standardCatch);

const updateMyKeys = async (rsaPrivateKeys, room, user) => {
  await rsaPrivateKeys
    .readPrivateKeys()
    .then(async (keysOutput) => {
      const keyBoxes = Object.values(keysOutput);
      var keyBox = keyBoxes.find((x) => x._id === room.id);
      if (keyBox) {
        const saltedKeys = room["saltedKeys" + this.props.auth.uid];
        saltedKeys &&
          rsa
            .decrypt(saltedKeys, user.key, "SHA-256", {
              name: "RSA-PSS"
            })
            .then(async (privateRoomKey) => {
              if (keyBox.key !== privateRoomKey) {
                const keyBoxConfirmed = await rsaPrivateKeys.setPrivateKey({
                  _id: room.id,
                  key: keyBox.key,
                  box: room.box
                });
                keyBoxConfirmed &&
                  console.log("keyBox established locally for " + room.id);
              } else
                console.log(
                  "there is a keyBox already registered for " + room.id
                );
            });
      } else {
        //add saltedKey to pouchDB (local-storage)
      }
    })
    .catch((err) => console.log(err.message));
};
export const roomKeys = async (
  room,
  rsaPrivateKeys,
  recipientsProfiled,
  rooms,
  user
) => {
  //same: room, or recipients && entityType + entityId
  if (room.publicRoomKey) {
    updateMyKeys(rsaPrivateKeys, room, user);
  } else {
    //new: room, or new recipients (or threadId from entity)
    return await rsa.generateKey(2048).then(async (roomBox) => {
      if (
        await rsaPrivateKeys.setPrivateKey({
          _id: room.id,
          key: roomBox.key,
          box: roomBox.box
        })
      ) {
        return Promise.all(
          recipientsProfiled.map(
            (user) =>
              new Promise((resolve, reject) => {
                const saltedKey = room["saltedKeys" + user.id];

                if (saltedKey) {
                  resolve(saltedKey); //String
                } else {
                  const saltedKey =
                    user.id +
                    "saltedKeys" +
                    rsa.encrypt(roomBox.key, user.box, "SHA-256", {
                      name: "RSA-PSS"
                    });
                  saltedKey && resolve(saltedKey);
                }
              })
          )
        ).then((saltedKeys) => {
          let p = 0;
          var rm = { ...room };
          saltedKeys.map((out, p) => {
            p++;
            const user = recipientsProfiled.find((x) => out.startsWith(x.id));
            return (rm["saltedKeys" + user.id] =
              user && out.substring(0, out.lastIndexOf(saltedKeys[p]).length));
          });
          delete rm.id;
          rm.box = roomBox.box;
          if (p === saltedKeys.length) rooms.doc(room.id).update(rm);
        });
      }
    });
  }
};
