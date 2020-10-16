<?php
    if(isset($_GET['fromStation']) && isset($_GET['toStation'])){
        $fromStation = $_GET['fromStation'];
        $toStation = $_GET['toStation'];
        $file = fopen("log.txt","a+");
        fwrite($file,"$fromStation,$toStation\n");
        fclose($file);
    }
?>