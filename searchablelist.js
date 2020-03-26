import React, { Component } from "react";
import { MDBCol } from "mdbreact";
import axios from "axios";
import { 
    addCustomStyle,
    addColorStyle
  } from "../../../utils/addCustomStyle.js";

class SearchableList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            searchValue: "",
            onLoad: true,
            listDetails: [],
            filteredListDetails: [],
            customClass: null,
            customId: null
        };
    }

    componentDidMount() {
        let td = this.props.inputJSON;
        let webServiceURL = "";

        td.componentPropertiesList.filter(newData => {
            if(newData.compPropType=="Webservice URL") {
                webServiceURL = newData.compPropVal;
                this.callWebService(webServiceURL);
            }
            if (newData.compPropType == "Custom Class") {
                this.setState({
                  customClass: (newData.compPropVal ==""|| newData.compPropVal==null) ? null : newData.compPropVal
                })
            }
            if (newData.compPropType == "Custom ID") {
                this.setState({
                  customId: newData.compPropVal =="" ? null : newData.compPropVal
                })
            }
            if (newData.compPropType == "disabled") {
                if(newData.compPropVal == "true") {
                    td.inputProp = 'disabled';
                }
                else {
                    td.inputProp = '';
                }
            }
        });

        this.setState({
            primaryId: td.primaryId
        })
    }
    
    callWebService = (webServiceURL) => {
        let derOptList = [];
        let td = this.props.inputJSON;
        td.componentPropertiesList.filter(newData => {
            if(newData.compPropType=="Webservice URL")
            {
                if(newData.compPropVal != null && newData.compPropVal != "") {
                    axios.get(webServiceURL)
                    .then(res => {
                        this.setState({listDetails : res.data, filteredListDetails : res.data});
                    })
                }
                else
                {
                    td.componentOptionList.filter((newData, index) => {
                        derOptList[index] = {listOption:newData.option, listChecked:newData.checked, listIndex:(index)};
                    });
                    this.setState({listDetails : derOptList, filteredListDetails: derOptList});
                }                
            }
        });
    }

    handleSearch = event => this.setState({ searchValue: event.target.value }, () => this.searchInList());

    handleCheck = (event) => {
        let valueStr = '';
        this.state.filteredListDetails[event.target.dataset.id].checked = !this.state.filteredListDetails[event.target.dataset.id].checked;
        console.log('Searchable List Checked '+JSON.stringify(this.state.filteredListDetails));
        this.state.filteredListDetails.map((item)=>{
            if (item.checked) {
                valueStr = (valueStr == '') ? item.listCode : (valueStr + ', ' + item.listCode);
            }
        })
        var req = {
            'value': valueStr,
            'key': this.props.inputJSON.primaryId,
            "componentType": this.props.inputJSON.componentType
        };

        this.props.inputJSON.fieldValue = valueStr;
        this.props.childData(req);
        this.forceUpdate();
    }

    searchInList = () => {
        
        this.setState(prevState => {
            const filteredListDetails = prevState.listDetails.filter(item => item['listOption'].toLowerCase().match(this.state.searchValue.toLowerCase()));
            return { filteredListDetails};
        });
    }

  render() {
    let td = this.props.inputJSON; //componentDTO
    console.log('Searchable list json: ',JSON.stringify(this.props.inputJSON));
    var opts = {};
    td.inputProp = 'disabled';  //disabled or readonly
    if(td.pageFlag == 2) {
        opts[td.inputProp] = td.inputProp;
    }
    if(td.pageFlag == 3) {
        opts['disabled'] = 'disabled';
    }
    let addStyles = addCustomStyle(td.settingsDTO);
    let mystyle = addColorStyle(td.settingsDTO);

    return (
        
          <MDBCol primaryId={td.primaryId}>
              <fieldset id={this.state.customId} data-component="SEARCHABLELIST" className={"compSearchList"+this.state.customClass+''+addStyles} style={mystyle}>
            <input
                value={this.state.searchValue}
                onChange={this.handleSearch}
                className="form-control"
                type="text"
                placeholder="Search..."
                aria-label="Search"
                {...opts}
            />
            <ol className="cSelectable list-unstyled mb-0">
              {
                this.state.filteredListDetails.map((item) => (
                  <li
                    key={item['listIndex']}
                    onClick={this.handleCheck.bind(this)}
                    className={item['checked'] ? 'selected' : 'unselected'}
                    data-id={item['listIndex']}
                    {...opts}>
                    {item['listOption']}
                  </li>
                ))
              }
            </ol>
            </fieldset>
          </MDBCol>
    );
  }
}

export default SearchableList;