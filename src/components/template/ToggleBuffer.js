// Dependencies
import React, { Fragment, useState } from "react";

import { useDispatch } from "react-redux";

// Actions
import { translate } from "actions/ConfigActions";
/* eslint-disable */
import {    
    GnInput,
    GnLabel  
} from "@kartverket/geonorge-web-components";
/* eslint-enable */
import ToggleHelpText from "./ToggleHelpText";



// Stylesheets
import style from "components/template/ToggleBuffer.module.scss";

const ToggleBuffer = ({onChange, item, tema, editable}) => {
    
const [bufferText, setBufferText] = useState(false)

    const toggleBuffertext = () => { 
        setBufferText(!bufferText);
    }  

    const showBufferValues = () => {
        const hasBuffertext = item?.dataSet?.bufferText || item?.dataSet?.bufferPossibleMeasures || item?.dataSset?.bufferDistance;        
       return (editable && bufferText) || (!editable && hasBuffertext);
    }
    const dispatch = useDispatch();        
    return (
        <Fragment>
            <div className={style.content}>
               
                         
                            {editable ? (<gn-input><input id="bufferja" name="buffersone" type="checkbox" onClick={toggleBuffertext} /></gn-input>) : ('')  }
                            <gn-label><label htmlFor="bufferja">Har treffet en buffersone? Vis innholdet for buffer <ToggleHelpText resourceKey="bufferDescription" /></label></gn-label>                           


                        {showBufferValues() ? <div className={style.buffercontent}>
                            <gn-label block>
                            <label htmlFor="datasetBufferText">
                                {dispatch(translate("labelDataSetBufferText", null, "Varseltekst ved treff på buffersone"))}
                                {tema === "Bygg" ? <ToggleHelpText resourceKey="dataSetBufferTextDescriptionBygg" showHelp={editable}/>: <ToggleHelpText resourceKey="dataSetBufferTextDescriptioPlan" showHelp={editable}/>}
                                </label>
                            </gn-label>
                            {editable ? (
                                <gn-input block fullWidth>
                                    <input
                                        id="datasetBufferText"
                                        name="bufferText"
                                        placeholder={dispatch(translate("dataSetBufferTextDescription", null, "titleDescription"))}
                                        defaultValue={item?.dataSet?.bufferText}
                                        onChange={onChange}
                                />
                            </gn-input>
                            
                        ) : (
                            <div id="datasetBufferText">{item?.dataSet?.bufferText}</div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetBufferPossibleMeasures">
                                {dispatch(translate("labelBufferPossibleMeasures", null, "Hva kan brukeren gjøre ved treff på buffersone"))}
                                {tema === "Bygg" ? <ToggleHelpText resourceKey="bufferPossibleMeasuresDescriptionBygg" showHelp={editable} />:<ToggleHelpText resourceKey="bufferPossibleMeasuresDescriptionPlan" showHelp={editable} />}
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-textarea block fullWidth>
                                <textarea
                                    id="datasetBufferPossibleMeasures"
                                    name="bufferPossibleMeasures"
                                    defaultValue={item?.dataSet?.bufferPossibleMeasures || ""}
                                    rows="4"
                                    placeholder={dispatch(translate("bufferPossibleMeasuresDescription", null, "titleDescription"))}
                                    onChange={onChange}
                                />
                            </gn-textarea>
                        ) : (
                            <div id="datasetBufferPossibleMeasures">
                                {item?.dataSet?.bufferPossibleMeasures || ""}
                            </div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetBufferDistance">
                                {dispatch(translate("labelDataSetBufferDistance", null, "Avstand i meter for når varselteksten for buffersone skal vises"))}
                                
                                
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetBufferDistance"
                                    name="bufferDistance"
                                    placeholder={dispatch(translate("dataSetBufferDistanceDescription", null, "titleDescription"))}
                                    defaultValue={item?.dataSet?.bufferDistance || ""}
                                    onChange={onChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="datasetBufferDistance">{item?.dataSet?.bufferDistance || ""}</div>
                        )}
                    </div> : '' }
            </div>
        
          
            
        </Fragment>
    );
};

export default ToggleBuffer;
