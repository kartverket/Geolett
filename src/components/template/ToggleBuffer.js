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


const ToggleBuffer = ({onChange, item, editable}) => {
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
                                {dispatch(translate("labelDataSetBufferText", null, "Buffertekst"))}
                                <ToggleHelpText resourceKey="dataSetBufferTextDescription" />
                                </label>
                            </gn-label>
                            {editable ? (
                                <gn-input block fullWidth>
                                    <input
                                        id="datasetBufferText"
                                        name="bufferText"
                                        defaultValue={item?.dataset?.bufferText}
                                        onChange={onChange}
                                />
                            </gn-input>
                        ) : (
                            <div id="datasetBufferText">{item?.dataset?.bufferText}</div>
                        )}

                        <gn-label block>
                            <label htmlFor="datasetBufferPossibleMeasures">
                                {dispatch(translate("labelBufferPossibleMeasures", null, "Mulige tiltak buffer"))}
                                <ToggleHelpText resourceKey="bufferPossibleMeasuresDescription" />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-textarea block fullWidth>
                                <textarea
                                    id="datasetBufferPossibleMeasures"
                                    name="bufferPossibleMeasures"
                                    defaultValue={item?.dataSet?.bufferPossibleMeasures || ""}
                                    rows="4"
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
                                {dispatch(translate("labelDataSetBufferDistance", null, "Buffer"))}
                                <ToggleHelpText resourceKey="dataSetBufferDistanceDescription" />
                            </label>
                        </gn-label>
                        {editable ? (
                            <gn-input block fullWidth>
                                <input
                                    id="datasetBufferDistance"
                                    name="bufferDistance"
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
