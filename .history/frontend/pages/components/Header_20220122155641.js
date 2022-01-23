import React from "react";


export default function Header() {
    return (
        <div className="flex flex-row shadow-md py-1 px-2 w-screen" id="nav_bar">
            <div onClick={() => { router.push("/") }} className="grow-0 flex items-center justify-center cursor-pointer" id="left_nav_bar">
                <img className="" src="/croppedPolychainLogo.png" alt="Polychain Logo" width="150" />
            </div>
            <div className="grow" id="spacer">  </div>
            <div className="grow-0 my-2 sm:mr-4 flex" id="right_nav_bar">
                {userAccount.address ?
                    <div className="flex flex-row">
                        {/* <CustomButton onClick={goToDashboard}>Dashboard</CustomButton> */}
                        {/* <h1><Link href="/dashboard">Dashboard</Link></h1> */}
                        <CustomBrandedButton onClick={redirectToProfile} className="">View Profile</CustomBrandedButton>
                        <CustomButton onClick={handleLogout}>Logout</CustomButton>
                    </div>
                    : (
                        <div>
                            <DropDownComponent primaryLabel="Login" label1="Ethereum" label2="Solana" label1onClick={ethLogin} label2onClick={solLogin} />
                        </div>
                    )}


            </div>
        </div>
    )
}