import React from 'react';
import { Helmet } from 'react-helmet';
import CustomInput from './customInput';
import CustomBrandedButton from './customBrandedButton';
import DropDownComponent from './DropDown';

function Script(props) {
    return (
        <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm bg-black p-6 text-white my-10">
            <h1>Add this to your website: </h1>
            <textarea className='script-textarea text-white bg-black border border-white-300 rounded-xl mt-2 p-1' readOnly={true}>{`<script src="http://polychain.tech/embed.prod.bundle.js" data-user="${props.user}" data-text="${props.text}" data-style="${props.style}"></script>`}</textarea>
        </div>
    )
}

class ButtonGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: 'Buy Me Some Crypto',
            style: 'regular',
            showScript: false
        }
        this.className = "flex flex-col items-center justify-center mx-4" + props.className
        this.setText = this.setText.bind(this);
        this.changeRegular = this.changeRegular.bind(this);
        this.changeInverted = this.changeInverted.bind(this);
        this.showScript = this.showScript.bind(this);
    }

    changeRegular() {
        this.setState({
            style: 'regular'
        });
    }

    changeInverted() {
        this.setState({
            style: 'inverted'
        });
    }

    setText(e) {
        this.setState({
            text: e.target.value
        });
    }

    showScript() {
        this.setState({
            showScript: true
        })
    }

    render() {
        return (
            <div className={this.className}>
                <Helmet>
                    <link href="/button.css" rel="stylesheet" />
                </Helmet>
                <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm bg-white">
                    <div className="flex justify-center bg-slate-300 p-8 rounded-t-xl">
                        <a className={`poly-btn ${this.state.style == 'inverted' && 'poly-btn-inverted'}`} href="#">
                            <span className="poly-btn-text">{this.state.text}</span>
                        </a>
                    </div>
                    <div className="flex p-3 sm:p-6">
                        <div className="styleDrop mr-1"><DropDownComponent primaryLabel={(this.state.style == "inverted") ? "Light" : "Dark"} label1="Dark" label2="Light" label1onClick={this.changeRegular} label2onClick={this.changeInverted} /></div>
                        <CustomInput className="text-sm mx-0 mr-1" value={this.state.text} onChange={this.setText} type="text" placeholder="Enter Text" />
                        <CustomBrandedButton className="text-xs sm:text-base py-1" onClick={this.showScript}>Generate</CustomBrandedButton>
                    </div>
                </div>
                {this.state.showScript && <Script user={this.props.username} text={this.state.text} style={this.state.style} />}
            </div>
        )
    }
}

export default ButtonGenerator;