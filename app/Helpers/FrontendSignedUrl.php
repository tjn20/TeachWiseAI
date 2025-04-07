<?php
namespace App\Helpers;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

use Illuminate\Support\InteractsWithTime;
use Illuminate\Support\Arr;

class FrontendSignedUrl
{
    use InteractsWithTime;
    public function customSignedUrl($baseUrl, $parameters = [], $expiration = null, $absolute = true)
    {
        $this->ensureSignedRouteParametersAreNotReserved(
            $parameters = Arr::wrap($parameters)
        );

        if ($expiration) {
            $parameters = $parameters + ['expires' => $this->availableAt($expiration)];
        }

        ksort($parameters);

        $key = env("frontend_key");

        $rt =  $baseUrl ."?expires={$parameters['expires']}";
        $parameters['signature'] =  hash_hmac('sha256', $rt, $key);
        return $baseUrl ."?expires={$parameters['expires']}&signature={$parameters['signature']}";
    }

    /**
     * Ensure the given signed route parameters are not reserved.
     *
     * @param  mixed  $parameters
     * @return void
     */
    protected function ensureSignedRouteParametersAreNotReserved($parameters)
    {
        if (array_key_exists('signature', $parameters)) {
            throw new \Exception(
                '"Signature" is a reserved parameter when generating signed routes. Please rename your route parameter.'
            );
        }

        if (array_key_exists('expires', $parameters)) {
            throw new \Exception(
                '"Expires" is a reserved parameter when generating signed routes. Please rename your route parameter.'
            );
        }
    }
}

?>