// Dependencies
import React, { Fragment, useState } from "react";

import { useDispatch } from "react-redux";
import { MDXEditor, headingsPlugin, listsPlugin,quotePlugin, thematicBreakPlugin, toolbarPlugin, BlockTypeSelect, UndoRedo,BoldItalicUnderlineToggles, CreateLink, ListsToggle, linkDialogPlugin, linkPlugin } from '@mdxeditor/editor'

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

const ToggleBuffer = ({onChange, item, setItem, tema, userkey, editable}) => {

const [bufferText, setBufferText] = useState(false)
console.log(item, "item")
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
                            {editable ? <gn-label><label htmlFor="bufferja">Har treffet en buffersone? Vis innholdet for buffer <ToggleHelpText resourceKey="bufferDescription" /></label></gn-label>  : null }                         


                        {showBufferValues() ? <div className={style.buffercontent}>
                            <gn-label block>
                            <label htmlFor="datasetBufferText">
                                {dispatch(translate("labelDataSetBufferText", null, "Varseltekst ved treff på buffersone"))}
                                {tema === "Bygg" ? <ToggleHelpText resourceKey="dataSetBufferTextDescriptionBygg" showHelp={editable}/>: <ToggleHelpText resourceKey="dataSetBufferTextDescriptionPlan" showHelp={editable}/>}
                                </label>
                            </gn-label>
                            {editable ? (
                                <gn-input block fullWidth>
                                    <input
                                        id="datasetBufferText"
                                        name="bufferText"
                                        placeholder={dispatch(translate("dataSetBufferTextDescription", null, ""))}
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
                            <div className={style.editorwrapper}>
                            <MDXEditor 
                            key={userkey}
                            markdown={item?.dataset?.bufferPossibleMeasures || ""}                           
                            contentEditableClassName={style.mdxeditor}
                           
                            onChange={value => onChange({name : "bufferPossibleMeasures", value})}
                            plugins={[
                                toolbarPlugin({
                                    toolbarClassName: style.editortoolbar,
                                    toolbarContents: () => (
                                      <>
                                        {' '}
                                        <BoldItalicUnderlineToggles />                                       
                                        <UndoRedo />  
                                        <CreateLink />                                                                    
                                      </>
                                    )
                                  }),
                                headingsPlugin(),   
                                linkDialogPlugin(),
                                linkPlugin(),                                      
                                listsPlugin(), 
                                quotePlugin(), 
                                thematicBreakPlugin()
                            ]} /></div>
                        ) : (
                            
                              <MDXEditor 
                             markdown={item?.dataset?.bufferPossibleMeasures || ""}
                             contentEditableClassName={style.mdxnoeditor}                                    
                             plugins={[]} readOnly />
                           
                        )}

                        <gn-label block>
                            <label htmlFor="datasetBufferDistance">
                                {dispatch(translate("labelDataSetBufferDistance", null, "Buffersone"))}
                                <ToggleHelpText resourceKey="datasetBufferDistance" showHelp={editable} />
                                
                                
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
