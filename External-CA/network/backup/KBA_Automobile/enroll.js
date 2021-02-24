const FabricCAServices = require('fabric-ca-client');
const yaml = require('js-yaml')
const fs = require('fs')
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const ccpPath = "./connection.yaml"
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = yaml.safeLoad(ccpJSON);
const caInfo = ccp.certificateAuthorities['ca.manufacturer.com'];
const ca = new FabricCAServices(caInfo.url, { verify: false }, caInfo.caName);
const walletPath = "./wallet"
const gateway = new Gateway();
const wallet = new FileSystemWallet(walletPath);
async function enrollAdmin() {
    const adminExists = await wallet.exists("admin");

    if (adminExists) {
        console.log("An identity for the admin user admin already exists in the wallet");
        return;
    }
    const enrollment = await ca.enroll({ enrollmentID: "admin", enrollmentSecret: 'adminpw' });
    const identity = X509WalletMixin.createIdentity("ManufacturerMSP", enrollment.certificate, enrollment.key.toBytes());
    await wallet.import("admin", identity);
}

// enrollAdmin()
let userName = "user8@manufacturer.auto.com"
let Sec = null;
async function registerUser(enrollID) {
    console.log(wallet)
    await gateway.connect(ccpPath, {
        wallet, identity: "admin", discovery: { enabled: true, asLocalhost: true }
    })
    let ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    const secret = await ca.register({
        enrollmentID: enrollID,
    }, adminIdentity);
    console.log(secret)
    Sec = secret;
}
// registerUser(userName)
async function enrollUser() {
    const csr = fs.readFileSync('./sample.csr', 'utf8');
    const req = {
        enrollmentID: userName,
        enrollmentSecret: "VoUYIwbGlOlD",
        csr: csr,
    };

    const enroll = await ca.enroll(req);
    console.log(enroll.rootCertificate)
    console.log(enroll.certificate)


}
enrollUser()